# Knowva

読書体験を、知恵に変える。

<p align="center">
  <img src="docs/images/home-dashboard.png" height="400" alt="ホーム画面">
  &nbsp;&nbsp;
  <img src="docs/images/chat-demo-v2.gif" height="420" alt="AIとの対話デモ">
  &nbsp;&nbsp;
  <img src="docs/images/insight-list.png" height="400" alt="気づき一覧">
</p>

## Knowva とは

"Know"（知る）と "Nova"（新星）を掛け合わせた造語。AIとの対話で読書体験を言語化し、長期的に蓄積するアプリケーションです。

本を読んで「面白かった」「勉強になった」で感想が止まってしまったり、せっかく読んだ本の内容を数ヶ月後にはほとんど忘れていたり。Knowvaは、そうした読書体験の取りこぼしに対するアプローチとして生まれました。

AIが「具体的にどの場面が印象に残った？」「それって今の仕事とどうつながる？」みたいに聞いてくれるので、なんとなくの読後感が自分の言葉になっていきます。対話の中で出てきたInsight（気づき）が保存されるので、過去の自分がどう考えていたかを後から振り返ることができます。

## 特徴

### 感想の言語化を手伝う

「面白かった」の先を一人で掘り下げるのは意外と難しいので、AIが質問しながら一緒に言葉にしていきます。ユーザーの目標や興味もふまえて「この本が今の自分にとってどういう意味があるか」まで掘り下げるので、よくある読書メモとは違う記録になります。

### 音声入力で手軽に

読書中はワンタップの音声入力で、思いついた時にさっと話して記録できます。あとはAIが整理してくれます。

### 読み返すと変化がわかる

対話から抽出したInsight（気づき）を保存しているので、同じ本を時間をおいて読み返すと、前回と今回で自分の感じ方がどう変わったか比べられます。似た気づき同士をAIがマージして整理することもできます。

<p align="center">
  <img src="docs/images/insight-list.jpg" height="400" alt="気づき一覧">
  &nbsp;&nbsp;
  <img src="docs/images/insight-merge.jpg" height="400" alt="気づきのマージ">
</p>
<p align="center">
  <sub>気づき一覧 &nbsp;|&nbsp; AIによるマージ</sub>
</p>

## その他の特徴

<p align="center">
  <img src="docs/images/voice-memo.jpg" width="200" alt="音声メモ">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/images/pop-timeline.jpg" width="200" alt="POPタイムライン">
</p>
<p align="center">
  <sub>音声メモ &nbsp;|&nbsp; POP タイムライン</sub>
</p>

- 読書レポートとアクションプランの生成
- 読書前後の心境変化をレーダーチャートで表示
- 週次・月次のメンター振り返り
- Insightやレポートを公開・匿名で共有できるタイムライン（POP）
- 読書活動に応じたバッジ

<p align="center">
  <img src="docs/images/pc-profile.png" height="500" alt="プロファイル">
  &nbsp;&nbsp;
  <img src="docs/images/pc-reading-report.png" height="500" alt="読書レポート">
</p>
<p align="center">
  <sub>プロファイル &nbsp;|&nbsp; プロファイルに基づく読書レポート（PC表示）</sub>
</p>

## AI エージェント構成（開発者向け）

用途ごとに5つのエージェントを使い分けています。

| エージェント | 何をするか |
|---|---|
| Reading Agent | 読書対話の本体。本を読みながらの対話やInsight抽出を担当 |
| BookGuide Agent | 本の内容に踏み込んだ質問（著者の意図、背景知識など）に答える。Reading Agentから呼び出される |
| Onboarding Agent | 初回利用時に目標や興味をヒアリングしてプロファイルをつくる |
| Mentor Agent | 週次・月次で読書活動を一緒に振り返り、次の一歩を提案する |
| Report Agent | 対話とInsightをまとめて読書レポートを生成し、アクションプランを出す |

各エージェントの詳細な仕様は [エージェント設計ドキュメント](docs/agents.md) を参照してください。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js (App Router) / TypeScript / Tailwind CSS |
| バックエンド | Python (FastAPI) / Google ADK / Gemini |
| データベース | Firestore |
| 認証 | Firebase Auth |
| インフラ | Firebase App Hosting / Cloud Run |

## ドキュメント

- [要件定義](docs/requirements.md): プロジェクトビジョン、ユーザージャーニー、機能要件
- [技術アーキテクチャ](docs/architecture.md): データモデル、API設計、システム構成
- [エージェント設計](docs/agents.md): 各AIエージェントの仕様と対話フロー
- [技術スタック](docs/tech-stack.md): 使用技術のバージョン一覧
- [CLAUDE.md](CLAUDE.md): 開発環境の構築手順、開発コマンド
