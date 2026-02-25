## ADDED Requirements

### Requirement: Recognize cost category keywords
各シートの先頭120行×10列をスキャンし、費目キーワード（直接材料費、加工費、設計費、試験費、出張費、梱包輸送費、雑費、製造原価、工場原価、総原価、GC/一般管理費、IP/利益、直接経費）に一致するテキストセルを検出する。

#### Scenario: Standard cost keywords found
- **WHEN** 原価計算シートの A10 セルに「直接材料費」、A15 セルに「加工費」がある
- **THEN** 2件の費目キーワードが検出され、それぞれのシート名・行番号・ラベルが記録される

#### Scenario: Partial keyword match
- **WHEN** セルに「直接材料費計」のようにキーワードを含むテキストがある
- **THEN** 「直接材料費」として認識される（部分一致対応）

### Requirement: Associate cost values with keywords
検出した費目キーワードの右方向にある最初の数値セルを金額として紐付ける。

#### Scenario: Value found to the right
- **WHEN** A10="直接材料費"、C10=1500000（数値）である
- **THEN** CostItem として label="直接材料費", value=1500000, sheet=シート名, row=10 が生成される

#### Scenario: No numeric value adjacent
- **WHEN** A10="直接材料費" だが右方向10列以内に数値セルがない
- **THEN** label="直接材料費", value=null として記録される（金額未検出）

### Requirement: Categorize cost items
認識した費目を以下のカテゴリに自動分類する: 直接材料費、加工費、設計費、試験費、出張費、梱包輸送費、雑費、その他。

#### Scenario: Known category assignment
- **WHEN** ラベルが「設計費」である
- **THEN** category="設計費" が割り当てられる

#### Scenario: GC and IP recognition
- **WHEN** ラベルが「GC」または「一般管理費」である
- **THEN** category="一般管理費" が割り当てられる
