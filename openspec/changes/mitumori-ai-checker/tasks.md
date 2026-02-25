## 1. プロジェクトセットアップ

- [x] 1.1 依存パッケージを追加する（xlsx, recharts, lodash, react-router-dom, tailwindcss + postcss + autoprefixer）
- [x] 1.2 Tailwind CSS を設定する（tailwind.config.js, postcss.config.js, index.css に @tailwind ディレクティブ追加）
- [x] 1.3 `src/checker/` ディレクトリ構成を作成する（agents/, components/, types.ts, utils.ts）
- [x] 1.4 `src/main.tsx` に react-router-dom を導入し、`/chat`（既存App）と `/checker`（CheckerApp）のルートを設定する

## 2. 型定義・ユーティリティ

- [x] 2.1 `src/checker/types.ts` に共通型を定義する（Sheet, NamedRange, CostItem, Finding, Recommendation, AnalysisResult, QualityScore）
- [x] 2.2 `src/checker/utils.ts` に SheetJS ヘルパーを実装する（ファイル読み込み、セル走査、数式文字列取得、結合セル情報取得）

## 3. エージェントパイプライン — 構造解析

- [x] 3.1 `agents/structureAgent.ts` を実装する — 各シートの行数/列数/数式数/結合セル数/クロスシート参照一覧/複雑度を算出
- [x] 3.2 `agents/namedRangeAgent.ts` を実装する — Workbook.Names から名前付き範囲（name, ref, scope）を抽出

## 4. エージェントパイプライン — 検出系

- [x] 4.1 `agents/formulaAgent.ts` を実装する — #REF!等の数式エラー検出（重大）、外部ブック参照検出（警告）、手動検証式検出（情報）
- [x] 4.2 `agents/costAgent.ts` を実装する — 先頭120行×10列スキャン、費目キーワードマッチ、右方向数値セル紐付け、カテゴリ分類
- [x] 4.3 `agents/anomalyAgent.ts` を実装する — カテゴリ別平均/標準偏差算出、±2σ超の異常値検出

## 5. エージェントパイプライン — スコアリング・提案

- [x] 5.1 `agents/recommendAgent.ts` を実装する — 品質スコア算出（100点 - 重大×15 - 警告×5 - 情報×1 - 構造ペナルティ）、改善提案5カテゴリ生成
- [x] 5.2 `src/checker/pipeline.ts` を実装する — 6ステップの逐次実行、進捗コールバック、全エージェント結果の統合

## 6. UIコンポーネント — アップロード・分析中

- [x] 6.1 `components/UploadScreen.tsx` を実装する — ファイル選択ボタン + ドラッグ＆ドロップ、50MB制限チェック、.xlsx バリデーション
- [x] 6.2 `components/AnalyzingScreen.tsx` を実装する — 6ステップのプログレスバー、Agent実行ログのリアルタイム表示、完了時ダッシュボードへ自動遷移

## 7. UIコンポーネント — ダッシュボード

- [x] 7.1 `components/Dashboard.tsx` を実装する — 4タブ（概要/検出事項/AI提案/シート詳細）のタブナビゲーション
- [x] 7.2 `components/ScoreGauge.tsx` を実装する — Recharts で円形ゲージ（80以上=緑、60以上=黄、60未満=赤）、数値テキスト併記
- [x] 7.3 `components/SheetMap.tsx` を実装する — 全シートタイル表示（エラー=赤枠、高複雑度=黄枠、正常=緑枠）
- [x] 7.4 `components/CostChart.tsx` を実装する — Recharts で費目構成棒グラフ、費目名ラベル付き
- [x] 7.5 `components/FindingsTable.tsx` を実装する — 検出事項一覧、重大度フィルタ（重大/警告/情報）、件数集計表示
- [x] 7.6 `components/Recommendations.tsx` を実装する — 優先度付き改善提案カード（高=赤、中=黄バッジ）、タイトル/説明/アクション/影響
- [x] 7.7 `components/SheetDetail.tsx` を実装する — 左サイドバーのシート選択、右ペインにシート詳細（サイズ/数式/結合/エラー/参照先）

## 8. 統合・ルートコンポーネント

- [x] 8.1 `src/checker/CheckerApp.tsx` を実装する — 状態管理（upload → analyzing → dashboard）、パイプライン呼び出し、結果の各コンポーネントへの配信
- [x] 8.2 概要タブに統計カード6枚（総シート数/総数式数/総エラー数/総結合セル数/総クロスシート参照数/品質スコア）を配置する
- [x] 8.3 ダークテーマの全体スタイリング（背景#0f172a、Tailwind ユーティリティクラス）を適用する
