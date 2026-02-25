## Context

既存アプリは Amplify Gen2 + Cognito認証付きの React SPA で、`App.tsx` にチャットUI（AgentCore連携）がある。本変更は既存のチャットUIに影響を与えず、見積チェッカーを独立した新ルートとして追加する。

POCフェーズのため、Excel解析はすべてブラウザ内で完結し、バックエンドへのファイル送信は行わない。エージェントパイプラインもルールベース（LLM不使用）で実装する。

## Goals / Non-Goals

**Goals:**
- Excelファイルをアップロードし、6ステップのルールベースエージェントで自動解析
- ダッシュボードで品質スコア・検出事項・改善提案・費目構成を可視化
- 30シート・500数式規模のExcelを10秒以内に解析完了
- 既存チャットUIとの共存（ルーティングによる切り替え）

**Non-Goals:**
- LLM API（Claude等）との連携（Phase 2）
- サーバーサイドでのExcel処理
- 見積Excelの自動生成・自動修正（Phase 3）
- 過去案件DBとの比較・工数推定（Phase 3）
- Cognito認証の変更（既存をそのまま利用）

## Decisions

### D-1: ルーティング — react-router-dom の導入

**決定**: `react-router-dom` v6 を導入し、`/chat`（既存チャットUI）と `/checker`（見積チェッカー）をルート分割する。

**理由**: 既存の `main.tsx` は `<Authenticator>` でラップした単一 `<App />` を描画している。ルーターを `<Authenticator>` の内側に配置することで、認証フローを壊さずに複数ページを追加できる。

**代替案**:
- タブ切り替え（ルーティングなし）→ URLで直接アクセスできず、共有性が低い
- 別アプリとして分離 → ビルド・デプロイ設定が複雑化し、POCには過剰

### D-2: Excel解析ライブラリ — SheetJS (xlsx)

**決定**: `xlsx`（SheetJS Community Edition）をブラウザ内で使用。

**理由**: ブラウザ上でExcelの数式文字列・結合セル情報・名前付き範囲を抽出可能。サーバー不要でセキュリティ要件（ファイル非送信）を満たす。

**代替案**:
- `exceljs` → ブラウザ対応するが、数式文字列の抽出が SheetJS より弱い
- サーバー側 `openpyxl`（Python） → 高精度だがバックエンド構築が必要。Phase 2で検討

**制約**: SheetJS Community Edition は数式の**評価**はできない（文字列として取得のみ）。エラー値（#REF!等）はセル値から検出し、数式パターンは正規表現で解析する。

### D-3: グラフ描画ライブラリ — Recharts

**決定**: `recharts` を採用。

**理由**: React コンポーネントとして宣言的に記述可能。棒グラフ（費目構成）・円形ゲージ（品質スコア）の実装が容易。バンドルサイズも許容範囲。

**代替案**:
- `chart.js` + `react-chartjs-2` → 汎用性は高いがReactとの統合がやや煩雑
- D3.js → 自由度は最高だが実装コストが高くPOCに不向き

### D-4: エージェントパイプラインのアーキテクチャ

**決定**: 各エージェントを独立した純粋関数として実装し、逐次パイプラインで実行する。

```
src/checker/
  agents/
    structureAgent.ts    — シート構造解析
    namedRangeAgent.ts   — 名前付き範囲抽出
    costAgent.ts         — 費目認識
    formulaAgent.ts      — 数式エラー・外部参照検出
    anomalyAgent.ts      — 異常値検出
    recommendAgent.ts    — 品質スコア算出・提案生成
  pipeline.ts            — 6ステップの逐次実行 + 進捗コールバック
```

**理由**: 各エージェントが `WorkbookData → AgentResult` の純粋関数であれば、テスト容易・Phase 2でのLLM Agent置き換えがクリーン。パイプラインは進捗コールバックでUIのプログレスバーを更新する。

**代替案**:
- Web Worker で並列実行 → エージェント間に依存関係があるため効果が限定的。構造が複雑化する割にメリットが薄い

### D-5: ディレクトリ構成

**決定**: 見積チェッカーのコードを `src/checker/` に集約し、既存の `src/App.tsx` とは分離する。

```
src/
  App.tsx                — 既存チャットUI（変更なし）
  main.tsx               — ルーター追加
  checker/
    CheckerApp.tsx       — 見積チェッカーのルートコンポーネント（状態管理）
    components/
      UploadScreen.tsx   — S-001: ファイルアップロード
      AnalyzingScreen.tsx — S-002: 分析中プログレス
      Dashboard.tsx      — S-003〜S-006: タブ付きダッシュボード
      ScoreGauge.tsx     — 品質スコアゲージ
      SheetMap.tsx       — シートマップタイル
      CostChart.tsx      — 費目構成棒グラフ
      FindingsTable.tsx  — 検出事項一覧
      Recommendations.tsx — AI提案カード
      SheetDetail.tsx    — シート詳細ビュー
    agents/              — 上記 D-4 参照
    types.ts             — 共通型定義（Sheet, Finding, CostItem 等）
    utils.ts             — Excel解析ユーティリティ
```

### D-6: UIテーマ

**決定**: 既存のダークテーマ（背景 #0f172a）に合わせ、Tailwind CSS でスタイリング。

**理由**: 仕様書の指定（ダークテーマベース）と既存アプリの統一感。Tailwind は既に devDependencies に含まれていないため追加が必要だが、ユーティリティファーストで迅速にプロトタイピング可能。

**代替案**:
- CSS Modules → スコープは安全だがプロトタイピング速度が劣る
- 既存の App.css を拡張 → グローバルCSSの肥大化リスク

## Risks / Trade-offs

**[SheetJS の数式評価制限]** → Community Edition は数式を評価できないため、計算結果の検証（合計値の整合性チェック等）はセルの値（計算済み値）と数式文字列のパターンマッチに依存する。Phase 2 で openpyxl 等のサーバー側解析に移行することで対応。

**[大規模Excelのブラウザメモリ]** → 30シート・500数式規模は問題ないが、それ以上のファイルではブラウザメモリが逼迫する可能性がある。50MBのファイルサイズ制限とUIでの警告表示で緩和。

**[Tailwind CSS の追加]** → 新たな devDependency の追加。既存の App.css と混在するが、見積チェッカー側は `src/checker/` に閉じているため影響は限定的。

**[ルーティング導入によるエントリポイント変更]** → `main.tsx` の変更が必要。既存の `<Authenticator>` ラッパーの内側にルーターを配置するため、認証フローへの影響は最小限。
