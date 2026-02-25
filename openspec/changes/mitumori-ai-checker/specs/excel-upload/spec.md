## ADDED Requirements

### Requirement: Accept xlsx file upload
システムは .xlsx 形式のファイルのみを受け付け、ブラウザ内で SheetJS を使用して Workbook オブジェクトに変換する。ファイルはサーバーに送信してはならない。

#### Scenario: Valid xlsx file selected
- **WHEN** ユーザーが .xlsx ファイル（50MB以下）を選択する
- **THEN** ファイルがブラウザ内で読み込まれ、SheetJS の Workbook オブジェクトが生成される

#### Scenario: File exceeds size limit
- **WHEN** ユーザーが 50MB を超えるファイルを選択する
- **THEN** エラーメッセージ「ファイルサイズが上限（50MB）を超えています」を表示し、ファイルを読み込まない

#### Scenario: Invalid file format
- **WHEN** ユーザーが .xlsx 以外のファイル（.xls, .csv, .pdf 等）を選択する
- **THEN** エラーメッセージ「.xlsx 形式のファイルのみ対応しています」を表示し、ファイルを読み込まない

### Requirement: Display sheet names after upload
ファイルアップロード完了後、Workbook に含まれる全シート名を Agent 実行ログに表示する。

#### Scenario: Multi-sheet workbook uploaded
- **WHEN** 10シートを含む .xlsx ファイルがアップロードされる
- **THEN** 10シートすべてのシート名が Agent 実行ログに一覧表示される

### Requirement: Drag and drop upload
ファイル選択ボタンに加え、ドラッグ＆ドロップによるファイルアップロードをサポートする。

#### Scenario: File dropped on upload area
- **WHEN** ユーザーが .xlsx ファイルをアップロードエリアにドロップする
- **THEN** ファイル選択ボタンと同様に読み込みが開始される
