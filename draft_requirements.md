### *Knowva (ノヴァ)** | "Know" (知る) と "Nova" (新星) の造語。未知の知識との出会い。

「本との出会い（📚読書の感想の言語化を手伝う→読書ログ→自分のProfile/Situationと掛け合わせて「思想」の蓄積）→「思想のバージョンアップ」」をコアとし、「ゴール設定」はヘビーユーザー向けのオプション機能、「コミュニティ」は将来的な拡張機能と位置づけ

**MVPのゴール:**

ユーザーが読んだ本の「感想や学び」を対話的に言語化し、それに基づいて自分の読書傾向（プロファイル）を蓄積・可視化し、AIが次に読むべき本を推薦する。読書体験を深め、次の読書につなげる好循環を生み出すAIエージェントアプリ。

#### AIエージェントの種類と役割
1. 読書の感想や学び・本のどこが好きなのかの言語化をサポートするエージェント
1-1. ユーザーのプロファイルを更新する
2. ユーザープロファイルを基に、適切な本を推薦するエージェント

#### MVP主要要件

| No. | 機能名 | 機能概要 |
| :-: | :--- | :--- |
| 1 | **ユーザー登録・ログイン** | メールアドレスとパスワードで基本的な認証を行う。 |
| 2 | **読書記録の追加** | 読んだ本の「タイトル」を入力する（手動またはAPI検索）。 |
| 3 | **音声入力対応（Speech to Text）** | 読書中や読後に、音声で感想・気づきを記録できる。音声認識APIを使用してテキスト化し、対話履歴や学びとして保存する。リアルタイム文字起こしで確認しながら記録可能。 |
| 4 | **AIとの対話的な振り返り** | 読んだ本について、AIエージェントが質問を投げかけ、ユーザーが答える形式で学びや感想を深堀りする。テキスト入力と音声入力の両方に対応。 |
| 5 | **学びの言語化と記録** | AIとの対話を通じて整理された「気づき」「学び」「好きなポイント」をテキストとして自動保存する。 |
| 6 | **ユーザープロファイル更新** | 記録された読書データから、ユーザーの興味・関心・読書傾向を自動で抽出・更新する。 |
| 7 | **読書履歴の表示** | 過去に読んだ本の一覧と、それぞれの学びの要約を表示する。 |
| 8 | **AIによる本の推薦** | ユーザープロファイルを基に、次に読むべき本をAIが3〜5冊提案する。 |

#### MVP開発のアクションプラン（タスクリスト）

1.  **設計フェーズ (1-2日)**
    *   [ ] 上記要件に基づいた画面ワイヤーフレームを作成する。
    *   [ ] データ構造を設計する（後述のデータ構造参照）。
    *   [ ] 技術スタック（言語、フレームワーク、DB、LLM API）を選定する。
    *   [ ] AIエージェントの対話フローとプロンプト設計を行う。
2.  **開発フェーズ (5-7日)**
    *   [ ] ユーザー認証機能とDBのセットアップを行う。
    *   [ ] 読書記録・対話履歴・プロファイルのデータ保存・表示機能（CRUD）を実装する。
    *   [ ] Speech to Text API（例: OpenAI Whisper API、Google Speech-to-Text、Web Speech API）を選定・実装する。
    *   [ ] 音声入力UI（録音ボタン、リアルタイム文字起こし表示）を実装する。
    *   [ ] LLM API（例: OpenAI API）と連携し、「対話的振り返り」「学びの抽出」「プロファイル更新」「本推薦」のプロンプトを設計・実装する。
    *   [ ] 対話UI（チャット形式、音声/テキスト切替）を実装する。
3.  **テスト・デプロイフェーズ (1-2日)**
    *   [ ] 全体の動作確認とバグ修正を行う。
    *   [ ] テスト環境にデプロイし、関係者で実際に使ってみる。

### データ構造
```mermaid
erDiagram
    USERS ||--o{ READINGS : "has"
    USERS ||--o{ USER_PROFILES : "has"
    BOOKS ||--o{ READINGS : "read by users"
    READINGS ||--o{ CONVERSATIONS : "has"
    READINGS ||--o{ INSIGHTS : "generates"
    USER_PROFILES ||--o{ RECOMMENDATIONS : "receives"
    BOOKS ||--o{ RECOMMENDATIONS : "recommended as"

    USERS {
        int user_id PK
        string name
        string email
        datetime created_at
    }

    BOOKS {
        int book_id PK
        string title "書籍名"
        string author "著者"
        string isbn "ISBN（オプション）"
        string publisher "出版社（オプション）"
        int publication_year "出版年（オプション）"
        json genres "ジャンル・カテゴリ"
        text description "書籍説明・概要"
        string cover_image_url "表紙画像URL（オプション）"
        datetime created_at
    }

    READINGS {
        int reading_id PK
        int user_id FK
        int book_id FK
        int reading_count "この本の通算読書回数（1回目、2回目...）"
        date reading_start_date "読み始めた日"
        date reading_end_date "読み終えた日（読書中の場合はnull）"
        text life_context "その時の人生の状況（仕事の状況、プライベートの状況、悩みなど）"
        text reading_purpose "なぜこのタイミングでこの本を読んだか・読もうと思ったきっかけ"
        text reading_mode "読書スタイル（通読、拾い読み、再読で特定章のみ、など）"
        text emotional_state "読書時の心理状態・気分"
        json reading_environment "読書環境（場所、時間帯、状況など）"
        datetime created_at
    }

    CONVERSATIONS {
        int conversation_id PK
        int reading_id FK
        string role "user or assistant"
        text message "対話内容"
        datetime created_at
    }

    INSIGHTS {
        int insight_id PK
        int reading_id FK
        text content "本から得た気づき・学び"
        text favorite_points "好きだったポイント"
        text key_takeaways "重要な学び"
        datetime created_at
    }

    USER_PROFILES {
        int profile_id PK
        int user_id FK
        json interests "興味・関心のタグやキーワード"
        json reading_preferences "読書傾向（ジャンル、テーマなど）"
        text summary "プロファイル要約"
        text life_stage "現在のライフステージ（学生、若手社会人、中堅、管理職、経営者、起業家、フリーランス、退職後など）"
        text current_situation "現在の状況（職業、業界、役職、組織規模など）"
        text career_path "キャリアの遍歴（転職歴、専門性の変遷、キャリアの転機など）"
        json life_milestones "人生の重要な出来事・転機（時系列での主要イベント）"
        text current_challenges "現在直面している課題・悩み・テーマ"
        text aspirations "将来の目標・夢・達成したいこと"
        json core_values "大切にしている価値観・信条・人生哲学"
        text reading_motivation "読書をする理由・読書に求めるもの"
        text intellectual_themes "現在探究している知的テーマ・問い"
        text background "教育背景・専門分野・得意領域"
        json influential_experiences "影響を受けた人物・出来事・体験"
        text personality_traits "性格特性・思考スタイル（分析的/直感的、理論派/実践派など）"
        text reading_context "読書の文脈（スキルアップ、自己探求、趣味、仕事、教養など）"
        datetime updated_at
    }

    RECOMMENDATIONS {
        int recommendation_id PK
        int user_id FK
        int book_id FK
        text reason "推薦理由"
        boolean is_read "読んだかどうか"
        datetime created_at
    }
```

### コアバリュー（仮説）

読書の経験を蓄積できる

### ユーザージャーニー
0. 現在のユーザーの情報（悩みとか）を入力しておく
1. 読む本を登録
2. 読書中にユーザーが情報をインプット（音声）。AIエージェントが話を引き出してもOK
3. 読み終わった後に、人生観の変化や軽い感想を記録
4. 初読書として保存される。ユーザープロファイルに変化が生じる

将来的にテキストのみの出力ではなく、アート（例：映像化、漫画）をできるとよい。
イメージ: https://rhizomatiks.com/