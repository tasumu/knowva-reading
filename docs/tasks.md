# Knowva - 開発タスク

## 実装完了（本番デプロイ済み）

### 設計フェーズ

- [x] データ構造設計（Firestoreコレクション構造）
- [x] 技術スタック選定（FastAPI, Next.js, ADK, Firestore）
- [x] AIエージェント設計（役割・責務・出力形式・ADK構成）
- [x] API設計（エンドポイント一覧・データフロー）
- [x] フロントエンド構成（ルーティング・コンポーネント構造）
- [x] AIエージェントのプロンプト詳細設計
- [x] 認証設計（Firebase Auth、メール/パスワード認証）

### 開発フェーズ - コア機能

- [x] ユーザー認証機能（Firebase Auth メール/パスワード）
- [x] 読書記録のCRUD（作成・表示・更新・削除）
- [x] Reading Agent実装（読書前・中・後の対話）
- [x] BookGuide SubAgent実装（専門的な質問への回答）
- [x] Onboarding Agent実装（初回プロファイル作成）
- [x] 対話UI（テキスト入力のチャット形式）
- [x] Insightの自動保存機能（ツール呼び出し）
- [x] 音声入力対応（Web Speech API）
- [x] 読書前後の心境変化の可視化（MoodForm/MoodChart）

### 開発フェーズ - 追加機能

- [x] SSEストリーミング対応（text_delta, tool_call, options_request等）
- [x] セッション初期化（`__session_init__`トリガーによるAI挨拶生成）
- [x] 対話モード設定（freeform/guided）
- [x] present_optionsツール（guidedモード用選択肢提示）
- [x] Mentor Agent実装（週次・月次振り返り）
- [x] 書籍検索サービス（Google Books API + openBD連携）
- [x] 書籍重複チェック機能（ISBN基準）
- [x] 公開Insightシステム（POP タイムライン）
- [x] Insight公開設定（private/public/anonymous）
- [x] ニックネーム設定（公開Insight用）
- [x] タイムライン表示設定（random/newest）
- [x] ユーザー設定画面（/settings）

### テスト・デプロイフェーズ

- [x] 全体の動作確認とバグ修正
- [x] 本番環境デプロイ
  - フロントエンド: Firebase App Hosting（`/frontend`をデプロイ）
  - バックエンド: Cloud Run（`/backend/Dockerfile`を使用）
  - データベース: Firestore（本番）
  - CI/CD: GitHub pushトリガーで自動デプロイ

---

## Phase 2 タスク（未実装）

以下の機能はドキュメントに記載されていますが、まだ実装されていません。
コード内に `# TODO(phase2):` コメントで記録されている箇所もあります。

### データ保存

- [ ] GCS生ログ保存 - セッション終了時に対話ログをGCSに永続保存する
  - 保存先: `gs://bucket/users/{userId}/sessions/{readingId}/{sessionId}/full_log.json`
  - コード内TODO: `backend/src/knowva/routers/sessions.py`
- [ ] 生ログからのInsight再生成機能

### AIエージェント

- [ ] プロファイル抽出エージェント - 対話ログからユーザー属性・価値観を自動抽出しプロファイル更新
  - コード内TODO: `backend/src/knowva/routers/sessions.py`
- [ ] 推薦エージェント - プロファイルに基づく書籍推薦
  - コード内TODO: `backend/src/knowva/main.py`（推薦APIルーター追加）
- [x] ルートオーケストレーター - 複数エージェントの統括（枠組み実装済み、ルーティングロジックは未実装）

### 機能拡張

- [ ] ベクトル検索・全文検索基盤
- [ ] 読書履歴の可視化・分析機能
- [ ] 音声録音対応（WebM形式でGCS保存）

### インフラ

- [ ] 本番Firebase Auth設定（Googleログイン等追加）

---

## 実装ファイル参照

### バックエンド主要ファイル

| ファイル | 内容 |
|---------|------|
| `backend/src/knowva/main.py` | FastAPIエントリポイント |
| `backend/src/knowva/agents/reading/agent.py` | Reading Agent |
| `backend/src/knowva/agents/reading/book_guide/agent.py` | BookGuide SubAgent |
| `backend/src/knowva/agents/onboarding/agent.py` | Onboarding Agent |
| `backend/src/knowva/agents/mentor/agent.py` | Mentor Agent |
| `backend/src/knowva/routers/sessions.py` | 対話セッションAPI |
| `backend/src/knowva/routers/readings.py` | 読書記録API |
| `backend/src/knowva/routers/moods.py` | 心境記録API |
| `backend/src/knowva/routers/books.py` | 書籍管理API |
| `backend/src/knowva/routers/timeline.py` | タイムラインAPI |
| `backend/src/knowva/routers/mentor.py` | メンターAPI |
| `backend/src/knowva/services/firestore.py` | Firestore操作 |
| `backend/src/knowva/services/book_search.py` | 書籍検索サービス |

### フロントエンド主要ファイル

| ファイル | 内容 |
|---------|------|
| `frontend/src/app/(main)/home/page.tsx` | ホーム画面 |
| `frontend/src/app/(main)/readings/page.tsx` | 読書一覧 |
| `frontend/src/app/(main)/readings/[readingId]/page.tsx` | 読書詳細 |
| `frontend/src/app/(main)/readings/[readingId]/chat/page.tsx` | 対話画面 |
| `frontend/src/app/(main)/mentor/page.tsx` | 振り返り画面 |
| `frontend/src/app/(main)/pop/page.tsx` | タイムライン画面 |
| `frontend/src/app/(main)/settings/page.tsx` | 設定画面 |
| `frontend/src/components/chat/ChatInterface.tsx` | チャットUI |
| `frontend/src/components/mood/MoodForm.tsx` | 心境入力フォーム |
| `frontend/src/components/mood/MoodChart.tsx` | 心境可視化 |
| `frontend/src/hooks/useStreamingChat.ts` | SSEストリーミング処理 |
| `frontend/src/hooks/useSpeechRecognition.ts` | 音声認識 |
