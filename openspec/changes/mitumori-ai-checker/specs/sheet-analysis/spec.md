## ADDED Requirements

### Requirement: Extract sheet metadata
各シートに対して行数、列数、数式セル数、結合セル数、総セル数を算出する。

#### Scenario: Standard sheet analyzed
- **WHEN** 120行×53列、数式80個、結合セル15個のシートを解析する
- **THEN** rows=120, cols=53, formulaCount=80, mergeCount=15, cellCount=6360 が算出される

### Requirement: Detect cross-sheet references
数式文字列を解析し、他シートへの参照（例: `=原価内訳!G110`）を一覧として抽出する。

#### Scenario: Formula with cross-sheet reference
- **WHEN** セルの数式が `=原価内訳!G110+試験!B20` を含む
- **THEN** クロスシート参照として「原価内訳!G110」「試験!B20」の2件が検出される

### Requirement: Calculate complexity rating
シートの数式数に基づき複雑度を判定する。数式100超＝高、30超＝中、それ以外＝低。

#### Scenario: High complexity sheet
- **WHEN** シートの数式セル数が 150 である
- **THEN** 複雑度が「高」と判定される

#### Scenario: Medium complexity sheet
- **WHEN** シートの数式セル数が 50 である
- **THEN** 複雑度が「中」と判定される

#### Scenario: Low complexity sheet
- **WHEN** シートの数式セル数が 20 である
- **THEN** 複雑度が「低」と判定される

### Requirement: Extract named ranges
Workbook の Names プロパティから名前付き範囲（name, ref, scope）を抽出する。

#### Scenario: Workbook with named ranges
- **WHEN** Workbook に `hisyo1`（参照先: 鑑!$B$3）、`_kou1`（参照先: 原価計算!$D$10）が定義されている
- **THEN** namedRanges に name="hisyo1", ref="鑑!$B$3" と name="_kou1", ref="原価計算!$D$10" が抽出される
