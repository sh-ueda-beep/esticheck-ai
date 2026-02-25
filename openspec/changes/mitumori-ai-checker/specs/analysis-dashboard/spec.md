## ADDED Requirements

### Requirement: Show analyzing progress screen
解析中、6ステップのプログレスバーと Agent 実行ログをリアルタイムで表示する。

#### Scenario: Pipeline execution progress
- **WHEN** エージェントパイプラインが Step 3/6（費目認識）を実行中
- **THEN** プログレスバーが 3/6 を表示し、Step 1〜2 は完了マーク、Step 3 は実行中アニメーション、Step 4〜6 は未実行として表示される

#### Scenario: Pipeline completion
- **WHEN** 全6ステップが完了する
- **THEN** プログレスバーが 6/6 となり、自動的にダッシュボード画面に遷移する

### Requirement: Display quality score gauge
品質スコアを円形ゲージで表示する。80以上＝緑、60以上＝黄、60未満＝赤。数値テキストを併記する。

#### Scenario: High quality score display
- **WHEN** 品質スコアが 85
- **THEN** 円形ゲージが緑色で 85 を表示する

#### Scenario: Low quality score display
- **WHEN** 品質スコアが 45
- **THEN** 円形ゲージが赤色で 45 を表示する

### Requirement: Display statistics cards
概要タブにて統計カード6枚（総シート数、総数式数、総エラー数、総結合セル数、総クロスシート参照数、品質スコア）を表示する。

#### Scenario: Statistics cards rendered
- **WHEN** 解析結果に sheets=12, formulaCount=350, errorCount=5, mergeCount=180, crossRefCount=45, score=72 がある
- **THEN** 6枚のカードにそれぞれの値が表示される

### Requirement: Display sheet map
全シートをタイル形式で表示し、エラーあり＝赤枠、高複雑度＝黄枠、正常＝緑枠で色分けする。

#### Scenario: Sheet with errors highlighted
- **WHEN** MC表シートに重大エラーが1件以上ある
- **THEN** MC表のタイルが赤枠で表示される

#### Scenario: Normal sheet display
- **WHEN** 鑑シートにエラーがなく複雑度が「低」
- **THEN** 鑑のタイルが緑枠で表示される

### Requirement: Display cost structure chart
費目構成を棒グラフで表示する。少なくとも5種類の費目がある場合に棒グラフが描画される。

#### Scenario: Cost chart with multiple categories
- **WHEN** 直接材料費、加工費、設計費、試験費、出張費、梱包輸送費の6費目が認識される
- **THEN** 6本の棒グラフが費目名ラベル付きで表示される

### Requirement: Display findings list with filters
検出事項タブにて全検出事項を一覧表示し、重大度（重大/警告/情報）でフィルタリング可能とする。

#### Scenario: Filter by severity
- **WHEN** ユーザーが「重大」フィルタを選択する
- **THEN** severity="重大" の検出事項のみが表示される

#### Scenario: All findings displayed
- **WHEN** フィルタ未選択の状態
- **THEN** 全重大度の検出事項が表示され、件数が重大度別に集計表示される

### Requirement: Display AI recommendations
AI提案タブにて改善提案をカード形式で表示する。各カードに優先度、タイトル、説明、推奨アクション、影響を記載する。

#### Scenario: Recommendation cards rendered
- **WHEN** 優先度「高」の提案2件と「中」の提案1件がある
- **THEN** 3枚のカードが優先度順に表示され、「高」が赤、「中」が黄のバッジで識別される

### Requirement: Display sheet detail view
シート詳細タブにて左サイドバーでシート選択、右ペインにシート詳細（サイズ、数式一覧、結合セル一覧、エラー一覧、参照先一覧）を表示する。

#### Scenario: Select sheet in sidebar
- **WHEN** ユーザーがサイドバーで「原価内訳」シートを選択する
- **THEN** 右ペインに原価内訳シートの行数/列数、数式セル一覧、結合セル一覧、エラー一覧、クロスシート参照先が表示される

### Requirement: Tab navigation
ダッシュボードは4つのタブ（概要/検出事項/AI提案/シート詳細）で構成し、タブ切り替えで各画面を表示する。

#### Scenario: Switch between tabs
- **WHEN** ユーザーが「検出事項」タブをクリックする
- **THEN** 検出事項一覧が表示され、他のタブ内容は非表示となる
