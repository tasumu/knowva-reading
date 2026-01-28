# Knowva - 技術アーキテクチャ仕様

## アーキテクチャ思想：曖昧さと再解釈の許容

### システム構成の全体像

Knowvaは**長期保存を本丸**として、以下の3層構成で設計します：

#### 1) 実行基盤（ADK + Cloud Run）
- **役割:** 会話の実行・ツール実行・セッション管理
- **技術:** ADK + Gemini API(ローカル)/Vertex(クラウド)
- **責務:** ユーザーとの対話を「聞き上手」に進行させる

#### 2) 長期保存層（**本丸**）
以下の二層で、数年後の振り返りを可能にします：

**a) Google Cloud Storage（生ログ層）- Phase 2**
- **保存内容:** 会話全文のJSON/テキストログ
- **目的:** 完全な記録の永続化（不変・削除なし）
- **将来性:** 新しいAIモデルでの再分析に備える

**b) Firestore（解釈層）- 実装済み**
- **保存内容:** 読み返し用の「要約」「メモ」「索引」
- **目的:** パフォーマンスの高いクエリと表示
- **位置づけ:** 生ログから再生成可能なキャッシュ

#### 3) 検索基盤（Phase 2以降）
- **ベクトル検索:** 曖昧検索を強くしたくなったら追加
- **候補:** Pinecone / Weaviate / Firestore Vector Search

---

## データ保存の二層化戦略（詳細）

Knowvaは、将来的なAIモデルの進化やマルチモーダルなアート化（Rhizomatiks的な展開）を見据え、**データを「生ログ層」と「解釈層」の二層で管理する**アーキテクチャを採用します。

### 生ログ層（Raw Data Layer）= Google Cloud Storage【Phase 2】
- **目的:** すべての対話・入力データを「その時点の生の記録」として永続化
- **保存先:** Google Cloud Storage (GCS)
- **保存内容:**
  - 対話の完全なJSON/テキストログ（会話全文）
  - ユーザー入力の生データ（タイムスタンプ付き）
- **特徴:**
  - **不変性:** 一度保存したら削除・編集しない
  - **再解釈可能性:** 将来的に新しいAIモデルで再分析できる
  - **数年後の振り返り:** 完全な会話履歴をいつでも読み返せる

### 解釈層（Interpretation Layer）= Firestore【実装済み】
- **目的:** アプリケーションが利用する「その時点でのAIの解釈」を保存
- **保存先:** Firestore
- **保存内容:**
  - 構造化された読書記録
  - AIが抽出した学び・気づき（要約）
  - 検索用の索引・メタデータ
  - ユーザープロファイル
- **特徴:**
  - **可変性:** AIモデルの進化に応じて再解釈・上書き可能
  - **パフォーマンス重視:** クエリ最適化された構造
  - **読み返し用:** UIで高速に表示するための最適化

---

## データ構造

### Firestoreコレクション構造【実装済み】

```
/books/{bookId}                          // ルートコレクション: 書籍マスタ
│   title, author, isbn?, cover_url?, description?,
│   google_books_id?, createdAt, updatedAt

/users/{userId}
│   name, email, createdAt
│   settings: {                          // ユーザー設定
│       interaction_mode: "freeform" | "guided",
│       timeline_order: "random" | "newest"
│   }
│
├── /profileEntries/{entryId}            // プロファイルエントリ
│       entry_type: "goal" | "interest" | "book_wish" | "other",
│       content, note?, created_at, updated_at
│
├── /readings/{readingId}                // 読書記録
│   │   book_id, book: { title, author, cover_url? }  // マスタ参照 + 非正規化
│   │   status: "not_started" | "reading" | "completed"
│   │   startDate, completedDate?
│   │   readingContext: { motivation?, notes? }
│   │   latestSummary?
│   │
│   ├── /insights/{insightId}            // 気づき・学び
│   │       content, type: "learning" | "impression" | "question" | "connection",
│   │       visibility: "private" | "public" | "anonymous",
│   │       reading_status, session_ref?, created_at
│   │
│   ├── /moods/{moodId}                  // 心境記録
│   │       mood_type: "before" | "after",
│   │       metrics: { energy, positivity, clarity, motivation, openness },
│   │       dominant_emotion, note?, created_at
│   │
│   └── /sessions/{sessionId}            // 対話セッション
│       │   session_type: "before_reading" | "during_reading" | "after_reading",
│       │   started_at, ended_at?, initialized?
│       │
│       └── /messages/{messageId}        // 対話メッセージ
│               role: "user" | "assistant",
│               content, input_type: "text" | "voice", created_at
│
├── /mentorFeedbacks/{feedbackId}        // メンターフィードバック
│       feedback_type: "weekly" | "monthly",
│       content, period_start, period_end, created_at
│
└── /recommendations/{recommendationId}  // おすすめ（Phase 2）
        bookId, book: { ... }, reason, profileFactors[], status, createdAt

/publicInsights/{publicInsightId}        // 公開Insightコレクション
    insight_id, user_id, content, type, display_name,
    book: { title, author }, reading_status, published_at
```

### 設計のポイント

| 項目 | 設計方針 |
|------|---------|
| ID | `string` (UUID自動生成) |
| 書籍情報 | `/books` マスタ + 各`readings`に非正規化 |
| ユーザー設定 | `users`ドキュメントに`settings`を埋め込み |
| プロファイル | `/profileEntries`サブコレクションで管理 |
| 気づき・学び | `readings`のサブコレクション（複数追記可能） |
| 公開Insight | 別コレクション `/publicInsights` で全ユーザー公開 |
| 対話履歴 | `sessions/messages`の2階層で管理 |

### 公開Insightの仕組み

Insightの`visibility`を変更すると：
- `public`: `/publicInsights`にコピー作成、`display_name`にニックネーム設定
- `anonymous`: `/publicInsights`にコピー作成、`display_name`を「読書家さん」に設定
- `private`: `/publicInsights`から削除

---

## 生ログ層のストレージ構造（Google Cloud Storage）【Phase 2】

```
/users/{userId}/
  ├── sessions/
  │   ├── {readingId}/
  │   │   ├── {sessionId}/
  │   │   │   ├── full_log.json       # 対話の完全ログ
  │   │   │   └── metadata.json       # セッションメタデータ
  │   │   └── ...
  ├── profile_snapshots/
  │   ├── {historyId}.json            # プロファイル変更時のスナップショット
  │   └── ...
```

---

## AIエージェント設計

### エージェント概要

| エージェント | 役割 | 起動タイミング | 状態 |
|------------|------|--------------|------|
| Reading Agent | ユーザーとの対話を通じて読書体験を深掘りし、感想・学びの言語化を支援 | ユーザーが対話を開始した時 | 実装済み |
| BookGuide SubAgent | 専門的な質問（概念解説、時代背景等）に回答 | Reading Agentが委譲 | 実装済み |
| Onboarding Agent | 初回プロファイル作成 | 新規ユーザー時 | 実装済み |
| Mentor Agent | 週次・月次で読書活動を振り返り、励ましとアドバイスを提供 | ユーザーからのリクエスト時 | 実装済み |
| Recommendation Agent | ユーザープロファイルに基づき次に読むべき本を提案 | ユーザーからのリクエスト時 | Phase 2 |
| Profile Extraction Agent | 対話ログからプロファイルを自動抽出 | セッション終了時 | Phase 2 |

### 各エージェントのTools

| エージェント | Tool名 | 機能 |
|------------|--------|------|
| reading_agent | `get_reading_context` | 現在のreading情報（書籍、状況等）を取得 |
| reading_agent | `save_insight` | 対話から抽出した気づきをFirestoreに保存 |
| reading_agent | `save_mood` | 心境データを保存（before/after） |
| reading_agent | `save_profile_entry` | 対話中に得られたプロファイル情報を保存 |
| reading_agent | `update_reading_status` | 読書ステータスを更新 |
| reading_agent | `present_options` | ユーザーに選択肢を提示（guidedモード専用） |
| book_guide_agent | `google_search` | 関連情報をWeb検索して回答を補強 |
| book_guide_agent | `get_book_info` | 本の詳細情報を取得 |
| onboarding_agent | `save_profile_entry` | プロファイル情報をFirestoreに保存 |
| onboarding_agent | `get_current_entries` | 既存のプロファイル情報を取得 |
| mentor_agent | `get_mentor_context` | 指定期間の読書履歴・Insight・プロファイルを取得 |
| mentor_agent | `save_mentor_feedback` | 振り返りコメントをFirestoreに保存 |
| recommendation_agent | `get_user_profile` | ユーザーの現在のプロファイルを取得（Phase 2） |
| recommendation_agent | `search_books` | 書籍を検索（Phase 2） |
| recommendation_agent | `save_recommendation` | 推薦結果をFirestoreに保存（Phase 2） |

### 対話モード

ユーザーは設定で対話モードを選択可能：

| モード | 説明 | present_optionsツール |
|--------|------|----------------------|
| `freeform` | 自由入力形式。ユーザー自身で考えて言語化したい人向け | 使用しない |
| `guided` | 選択肢ガイド形式。AIに選択肢を示してほしい人向け | 積極的に使用 |

### Session Service

| 環境 | Session Service | 備考 |
|------|----------------|------|
| ローカル開発 | `FirestoreSessionService` | セッション状態をFirestoreに永続化 |
| 本番 | `FirestoreSessionService` | 同上 |

---

## API設計

### エンドポイント一覧

#### 読書管理

| Method | Path | 概要 | 状態 |
|--------|------|------|------|
| GET | `/api/readings` | ユーザーの読書一覧取得 | 実装済み |
| POST | `/api/readings` | 新規読書記録作成 | 実装済み |
| GET | `/api/readings/{readingId}` | 読書詳細取得 | 実装済み |
| PATCH | `/api/readings/{readingId}` | 読書ステータス更新 | 実装済み |
| GET | `/api/readings/{readingId}/insights` | Insight一覧取得 | 実装済み |
| PATCH | `/api/readings/{readingId}/insights/{insightId}/visibility` | Insight公開設定変更 | 実装済み |

#### 書籍管理

| Method | Path | 概要 | 状態 |
|--------|------|------|------|
| GET | `/api/books/search?q=` | 書籍検索（Google Books API経由） | 実装済み |
| POST | `/api/books` | 書籍登録（重複チェック、openBD補完） | 実装済み |
| GET | `/api/books/{bookId}` | 書籍詳細取得 | 実装済み |

#### 対話セッション

| Method | Path | 概要 | 状態 |
|--------|------|------|------|
| POST | `/api/readings/{readingId}/sessions` | 新規セッション開始 | 実装済み |
| GET | `/api/readings/{readingId}/sessions` | セッション一覧取得 | 実装済み |
| POST | `/api/readings/{readingId}/sessions/{sessionId}/init` | セッション初期化（AI挨拶生成、SSE） | 実装済み |
| POST | `/api/readings/{readingId}/sessions/{sessionId}/messages` | メッセージ送信（非ストリーミング） | 実装済み |
| POST | `/api/readings/{readingId}/sessions/{sessionId}/messages/stream` | メッセージ送信（SSEストリーミング） | 実装済み |
| GET | `/api/readings/{readingId}/sessions/{sessionId}/messages` | メッセージ履歴取得 | 実装済み |
| POST | `/api/readings/{readingId}/sessions/{sessionId}/end` | セッション終了 | 実装済み |

#### 心境記録

| Method | Path | 概要 | 状態 |
|--------|------|------|------|
| POST | `/api/readings/{readingId}/moods` | 心境記録を保存 | 実装済み |
| GET | `/api/readings/{readingId}/moods` | 心境記録一覧 | 実装済み |
| GET | `/api/readings/{readingId}/moods/comparison` | 心境比較データ取得 | 実装済み |

#### プロファイル

| Method | Path | 概要 | 状態 |
|--------|------|------|------|
| GET | `/api/profile/insights` | 全Insight一覧（グループ化対応） | 実装済み |
| GET | `/api/profile/entries` | プロファイルエントリ一覧 | 実装済み |
| POST | `/api/profile/entries` | プロファイルエントリ作成 | 実装済み |
| PUT | `/api/profile/entries/{entryId}` | プロファイルエントリ更新 | 実装済み |
| DELETE | `/api/profile/entries/{entryId}` | プロファイルエントリ削除 | 実装済み |
| GET | `/api/profile/name` | ニックネーム取得 | 実装済み |
| PUT | `/api/profile/name` | ニックネーム更新 | 実装済み |
| GET | `/api/profile/settings` | ユーザー設定取得 | 実装済み |
| PUT | `/api/profile/settings` | ユーザー設定更新 | 実装済み |
| POST | `/api/profile/chat` | Onboarding Agentとチャット | 実装済み |
| POST | `/api/profile/chat/reset` | プロファイルチャットリセット | 実装済み |

#### メンター

| Method | Path | 概要 | 状態 |
|--------|------|------|------|
| POST | `/api/mentor/chat` | Mentor Agentとチャット | 実装済み |
| GET | `/api/mentor/feedbacks` | フィードバック履歴取得 | 実装済み |
| GET | `/api/mentor/feedbacks/latest` | 最新フィードバック取得 | 実装済み |
| POST | `/api/mentor/reset` | メンターセッションリセット | 実装済み |

#### タイムライン（POP）

| Method | Path | 概要 | 状態 |
|--------|------|------|------|
| GET | `/api/timeline` | 公開Insightタイムライン取得 | 実装済み |

#### 推薦

| Method | Path | 概要 | 状態 |
|--------|------|------|------|
| POST | `/api/recommendations/generate` | 推薦生成リクエスト | Phase 2 |
| GET | `/api/recommendations` | 推薦一覧取得 | Phase 2 |

---

## SSEストリーミング実装

### イベントタイプ

| イベント | データ内容 | 説明 |
|----------|-----------|------|
| `message_start` | `{message_id}` | メッセージ開始 |
| `text_delta` | `{delta}` | テキスト差分（リアルタイム表示用） |
| `tool_call_start` | `{tool_name, tool_call_id}` | ツール呼び出し開始 |
| `tool_call_done` | `{tool_call_id, result}` | ツール呼び出し完了 |
| `options_request` | `{prompt, options, allow_multiple, allow_freeform}` | 選択肢提示（guidedモード） |
| `text_done` | `{text}` | テキスト完了 |
| `message_done` | `{message}` | メッセージ完了 |
| `error` | `{code, message}` | エラー |

### セッション初期化

`/sessions/{sessionId}/init` エンドポイントで `__session_init__` トリガーメッセージを送信。
エージェントが読書記録のコンテキスト（書籍情報、読書ステータス等）に応じた初期挨拶を生成。
既に初期化済みのセッションでは何も行わない。

---

## 書籍検索サービス

### 外部API連携

| API | 用途 | 取得情報 |
|-----|------|---------|
| Google Books API | 書籍検索 | タイトル、著者、ISBN、サムネイル |
| openBD API | 書籍詳細補完 | 表紙画像（高解像度）、概要 |

### 書籍登録フロー

1. Google Books APIで検索
2. ユーザーが書籍を選択
3. ISBNが既存の場合は既存bookIdを返却
4. 新規の場合はopenBDで詳細を補完して登録

### 重複チェック

- 検索結果に `existing_book_id` を含める（ISBNで既存書籍を検出）
- `has_reading` フラグでユーザーの既存読書記録を表示

---

## データフロー

### 対話フロー（SSEストリーミング）

```
User → Next.js → POST /api/.../messages/stream → FastAPI
                                                    │
                                                    ▼
                                             ADK Runner.run_async()
                                                    │
                                                    ├── LLM API (Gemini)
                                                    ├── save_insight (Firestore)
                                                    ├── present_options (guidedモード時)
                                                    │
                                                    ▼
                                             SSE Events (text_delta, tool_call, etc.)
                                                    │
                                                    ▼
                                             Next.js → User (リアルタイム表示)
```

### セッション初期化フロー

```
User → POST /api/.../sessions/{id}/init → FastAPI
                                            │
                                            ├── 1. 初期化済みチェック
                                            ├── 2. "__session_init__" メッセージをADKに送信
                                            ├── 3. エージェントがコンテキストに応じた挨拶を生成
                                            ├── 4. initialized=true に更新
                                            │
                                            ▼
                                     SSE Events → AI挨拶メッセージ
```

---

## 技術スタック

### 1) 実行基盤（ADK + Cloud Run）
- **Agent Framework:** Agent Development Kit (ADK) + google-genai SDK
- **LLM:** Gemini（現在 `gemini-3-flash-preview`）、本番はVertex AI経由
- **セッション管理:** FirestoreSessionService

### 2) 長期保存層（本丸）
- **a) Google Cloud Storage（生ログ層）:** Phase 2
- **b) Firestore（解釈層）:** 実装済み

### 3) 検索基盤
- ベクトル検索: Phase 2
- 全文検索: Phase 2

### フロントエンド
- **Next.js 16 (App Router)** + TypeScript + Tailwind CSS 4
- 音声入力: Web Speech API（実装済み）

#### ルーティング構成

```
/login, /register          -- 認証ページ
/home                      -- ダッシュボード（振り返り、最近の読書、気づき、プロファイル）
/readings                  -- 読書一覧
/readings/[readingId]      -- 読書詳細（insights、mood、セッション履歴）
/readings/[readingId]/chat -- 対話UI（メインインタラクション）
/mentor                    -- 振り返りエージェント（対話 + 履歴タブ）
/pop                       -- 公開Insightタイムライン（POP）
/settings                  -- ユーザー設定（対話モード、タイムライン表示順、ニックネーム）
```

#### 主要コンポーネント

| コンポーネント | 役割 |
|--------------|------|
| `ChatInterface` | メッセージリスト + 入力欄（対話UI） |
| `StreamingMessageBubble` | ストリーミングテキスト表示 |
| `OptionsSelector` | 選択肢ボタンUI（guidedモード用） |
| `ChatInput` | テキスト/音声入力（VoiceInput統合） |
| `ReadingCard` | 読書一覧の各カード表示 |
| `InsightCard` | 気づき・学びの表示カード |
| `MoodForm` | 心境記録フォーム（5メトリクス） |
| `MoodChart` | 心境可視化（レーダー/バーチャート） |
| `TimelineCard` | 公開Insight表示カード |
| `MentorChatInterface` | メンターエージェントとの対話UI |
| `MentorFeedbackList` | フィードバック履歴表示 |
| `BookSearchInput` | Google Books API検索 |

#### 状態管理・データ取得
- Server Components をベースとし、インタラクティブ部分のみ Client Components
- データ取得: fetch API + useEffect
- 対話UI: Server-Sent Events (SSE) でストリーミングレスポンス受信
- カスタムHooks: `useStreamingChat`, `useSpeechRecognition`, `useMentorChat`

### バックエンド
- **Python 3.12+ (FastAPI)** + uv
- Firebase Auth ミドルウェア

### インフラ

#### 本番環境（デプロイ済み）
- **フロントエンド:** Firebase App Hosting
  - `/frontend` ディレクトリをデプロイ
  - GitHub pushトリガーで自動デプロイ
- **バックエンド:** Cloud Run
  - `/backend/Dockerfile` を使用
  - GitHub pushトリガーで自動デプロイ
- **データベース:** Firestore（本番）
- **認証:** Firebase Auth（メール/パスワード）
- **Firebase Project ID:** `knowva-reading`

#### Phase 2以降
- **GCS:** 生ログ保存
- 非同期処理: Cloud Functions
