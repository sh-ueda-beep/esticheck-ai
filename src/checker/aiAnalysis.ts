import type { AnalysisResult } from './types';

// AgentCore Runtime SSE呼び出しユーティリティ
export async function runAiAnalysis(params: {
  analysisResult: AnalysisResult;
  accessToken: string;
  agentArn: string;
  onText: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}): Promise<void> {
  const { analysisResult, accessToken, agentArn, onText, onDone, onError } = params;

  // 分析結果をJSON化してプロンプトに埋め込む
  const prompt = `以下のExcel見積書の品質分析結果を詳細に分析し、具体的な改善提案を生成してください。

## 分析結果データ
\`\`\`json
${JSON.stringify(analysisResult, null, 2)}
\`\`\`

上記データに基づき、構造的リスク、金額の妥当性、運用リスク、改善の優先順位の観点から分析してください。`;

  try {
    const url = `https://bedrock-agentcore.ap-northeast-1.amazonaws.com/runtimes/${encodeURIComponent(agentArn)}/invocations?qualifier=DEFAULT`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'x-amzn-bedrock-agentcore-runtime-session-id': crypto.randomUUID(),
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`API呼び出しに失敗しました (${res.status})`);
    }

    // SSEストリーミングを処理
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      let sseEventName = '';
      for (const line of decoder.decode(value, { stream: true }).split('\n')) {
        if (line.startsWith('event: ')) {
          sseEventName = line.slice(7).trim();
          continue;
        }
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          // テキストイベントのみ処理（ツール使用なし）
          if (sseEventName === 'message' && parsed.text) {
            onText(parsed.text);
          }
        } catch {
          // JSON parse失敗は無視
        }
        sseEventName = '';
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error('AI分析中にエラーが発生しました'));
  }
}
