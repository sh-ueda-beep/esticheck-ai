## ADDED Requirements

### Requirement: Calculate quality score
全検出結果を統合し、100点満点の品質スコアを算出する。算出式: 基本点100 - (重大エラー×15) - (警告×5) - (情報×1) - (結合セル200超で-5) - (数式500超で-3)。最終スコアは max(0, min(100, 計算結果))。

#### Scenario: Perfect score
- **WHEN** 検出事項が0件で、結合セル合計200以下、数式合計500以下
- **THEN** 品質スコアは 100

#### Scenario: Score with critical errors
- **WHEN** 重大エラー3件、警告2件、情報5件が検出される
- **THEN** スコア = 100 - 45 - 10 - 5 = 40

#### Scenario: Score clamped to zero
- **WHEN** 重大エラー10件（-150点分）が検出される
- **THEN** スコアは 0（負の値にならない）

#### Scenario: Structural penalties applied
- **WHEN** 重大エラー0件だが、結合セル合計が250、数式合計が600
- **THEN** スコア = 100 - 5 - 3 = 92

### Requirement: Generate improvement recommendations
全検出結果を分析し、以下の5カテゴリで優先度付き改善提案を生成する: (1)重大エラー修正、(2)外部参照解消、(3)構造改善、(4)チェック自動化、(5)原価構成可視化。

#### Scenario: Critical error recommendation
- **WHEN** #REF! エラーが3件検出される
- **THEN** priority="高", title="数式エラーの修正", action に対象セル一覧を含む提案が生成される

#### Scenario: External reference recommendation
- **WHEN** 外部ブック参照が5件検出される
- **THEN** priority="中", title="外部参照の解消" の提案が生成される

#### Scenario: No findings
- **WHEN** 検出事項が0件
- **THEN** priority="情報", title="良好な品質" の肯定的フィードバックが生成される

### Requirement: Assign recommendation priority
提案の優先度は 高/中/低/情報 の4段階とする。重大エラー関連は「高」、警告関連は「中」、情報関連は「低」、全般的なフィードバックは「情報」。

#### Scenario: Priority assignment
- **WHEN** 重大エラー修正の提案を生成する
- **THEN** priority="高" が割り当てられる
