import type { AnalysisResult, Finding, Recommendation } from './types';

// 分析結果からコンパクトなサマリー文字列を生成する
function buildAnalysisSummary(analysisResult: AnalysisResult): string {
  const { sheets, allFindings, qualityScore } = analysisResult;

  // 検出事項の件数内訳
  const countBySeverity = (severity: Finding['severity']) =>
    allFindings.filter(f => f.severity === severity).length;

  const lines: string[] = [
    `品質スコア: ${qualityScore.score}点`,
    `シート数: ${sheets.length}`,
    `検出事項: 重大${countBySeverity('重大')}件 / 警告${countBySeverity('警告')}件 / 情報${countBySeverity('情報')}件`,
    '',
    '主な検出事項:',
  ];

  // 最大10件を1行ずつテキスト化
  for (const f of allFindings.slice(0, 10)) {
    const location = f.cell ? `${f.sheet}!${f.cell}` : f.sheet;
    lines.push(`- [${f.severity}] ${location}: ${f.message}`);
  }
  if (allFindings.length > 10) {
    lines.push(`  …他${allFindings.length - 10}件`);
  }

  return lines.join('\n');
}

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

  const prompt = `以下のExcel見積書の品質分析結果を詳細に分析し、具体的な改善提案を生成してください。

## 分析サマリー
${buildAnalysisSummary(analysisResult)}

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

// 特定の推奨項目に対するAI詳細レビュー
export async function runAiReviewForRecommendation(params: {
  recommendation: Recommendation;
  analysisResult: AnalysisResult;
  accessToken: string;
  agentArn: string;
  onText: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}): Promise<void> {
  const { recommendation, analysisResult, accessToken, agentArn, onText, onDone, onError } = params;

  const prompt = `以下の見積書分析で検出された問題について詳細にレビューしてください。

## 対象項目
タイトル: ${recommendation.title}
優先度: ${recommendation.priority}
説明: ${recommendation.description}
推奨アクション: ${recommendation.action}
影響: ${recommendation.impact}

## 分析サマリー（参考）
${buildAnalysisSummary(analysisResult)}

この問題について、根本原因の分析、具体的な修正手順、リスク評価を詳しく説明してください。`;

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
