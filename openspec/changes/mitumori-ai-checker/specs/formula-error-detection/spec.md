## ADDED Requirements

### Requirement: Detect formula error values
セル値に含まれる Excel 数式エラー（#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?, #NULL!）を重大度「重大」として検出する。

#### Scenario: REF error in cell
- **WHEN** MC表シートのセル O2 の値が #REF! である
- **THEN** severity="重大", type="formula-error", sheet="MC表", cell="O2", message="#REF! エラー" の検出事項が生成される

#### Scenario: Multiple error types
- **WHEN** シート内に #REF! が2件、#DIV/0! が1件存在する
- **THEN** 重大度「重大」の検出事項が3件生成され、それぞれのエラー種別・セル位置が記録される

### Requirement: Detect external workbook references
数式文字列に含まれる外部ブック参照（`[ブック名]シート名!セル` 形式）を重大度「警告」として検出する。

#### Scenario: External reference found
- **WHEN** セルの数式が `=[2]出張計算!B10` を含む
- **THEN** severity="警告", type="external-ref", message="外部ブック参照: [2]出張計算!B10" の検出事項が生成される

### Requirement: Detect manual validation formulas
IF 関数内に「計算間違い」「エラー」等の検証用文字列を含む数式を重大度「情報」として検出する。

#### Scenario: Manual check formula found
- **WHEN** セルの数式が `=IF(A1<>B1,"計算間違い!!","")` である
- **THEN** severity="情報", type="manual-check", message="手動検証式を検出" の検出事項が生成される
