import { Agent, BedrockModel } from '@strands-agents/sdk'
import { BedrockAgentCoreApp } from 'bedrock-agentcore/runtime'
import { z } from 'zod'

// リクエストスキーマ
const requestSchema = z.object({
    prompt: z.string(),
})

// --- システムプロンプト ---
const SYSTEM_PROMPT = `あなたは製造業の見積書（Excel）品質分析の専門家です。

## 役割
ルールベースの品質分析結果（JSON）を受け取り、文脈に応じた具体的な改善提案を生成します。

## 入力データの構造
以下のJSON形式で分析結果が提供されます:
- sheets: 各シートの構造情報（行数、列数、数式数、結合セル数、複雑度）
- costStructure: 費目の一覧（シート名、行番号、ラベル、金額、数式、カテゴリ）
- allFindings: 検出事項（種別、重大度、メッセージ、詳細、シート名、セル位置）
- qualityScore: 品質スコア（0-100）とその内訳
- recommendations: ルールベースの改善提案

## 分析の観点
1. **構造的リスク**: シート間の依存関係、結合セルの多用、複雑な数式チェーン
2. **金額の妥当性**: 費目間のバランス、異常値の背景推測、業界標準との比較
3. **運用リスク**: 外部参照のリンク切れ、手動入力箇所の誤入力リスク
4. **改善の優先順位**: 影響度と修正コストを考慮した具体的なアクションプラン

## 出力形式
Markdown形式で以下の構成で出力してください:

### 総合評価
品質スコアの意味と全体的な印象を1-2文で。

### 重要な改善ポイント
優先度の高い順に、具体的な改善提案を記述。各提案には:
- 何が問題か
- なぜ問題か（ビジネスインパクト）
- 具体的な修正手順

### 費目構成の分析
費目のバランスや異常値についてのコメント。

### 運用改善の提案
長期的な品質維持のためのプロセス改善提案。

## 注意事項
- 具体的なセル位置やシート名を引用して説明してください
- 推測や仮定がある場合は明示してください
- 金額は3桁区切りのカンマ付きで表示してください`

// --- エージェント ---
const agent = new Agent({
    model: new BedrockModel({
        modelId: 'jp.anthropic.claude-sonnet-4-6',
        region: process.env['AWS_REGION'] ?? 'us-east-1',
    }),
    tools: [],  // ツール不要 — 分析データはpromptに含まれる
    systemPrompt: SYSTEM_PROMPT,
})

// --- SSEストリーミング ---
const app = new BedrockAgentCoreApp({
    invocationHandler: {
        requestSchema,
        process: async function* (request) {
            for await (const event of agent.stream(request.prompt)) {
                // テキスト出力のみ（ツール使用なし）
                if (event.type === 'modelContentBlockDeltaEvent' && event.delta?.type === 'textDelta') {
                    yield { event: 'message', data: { text: event.delta.text } }
                }
            }
        },
    },
})

app.run()
