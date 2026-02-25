## ADDED Requirements

### Requirement: Detect statistical anomalies in cost items
同一カテゴリの費目グループ内で、平均値から標準偏差の2倍以上乖離した金額を異常値として検出する。

#### Scenario: Anomalous value detected
- **WHEN** 「設計費」カテゴリに [100万, 120万, 110万, 500万] の4件がある（平均207.5万、σ≈191万）
- **THEN** 500万の値が異常値として検出され、severity="警告", シート名・行番号・乖離幅が記録される

#### Scenario: No anomaly in uniform values
- **WHEN** 「加工費」カテゴリに [100万, 105万, 98万] の3件がある
- **THEN** 異常値は検出されない

#### Scenario: Single item in category
- **WHEN** あるカテゴリに1件のみの費目がある
- **THEN** 統計的比較ができないため、異常値検出をスキップする

### Requirement: Report anomaly details
異常値が検出された場合、シート名・行番号・金額・カテゴリ平均・乖離幅を含む Finding を生成する。

#### Scenario: Anomaly finding format
- **WHEN** 設計費カテゴリで500万の異常値が検出される（平均207.5万）
- **THEN** Finding に sheet, row, value=5000000, categoryMean=2075000, deviation の情報が含まれる
