import type * as XLSX from 'xlsx';
import type { AnalysisResult, PipelineStep } from './types';
import { structureAgent } from './agents/structureAgent';
import { namedRangeAgent } from './agents/namedRangeAgent';
import { costAgent } from './agents/costAgent';
import { formulaAgent } from './agents/formulaAgent';
import { anomalyAgent } from './agents/anomalyAgent';
import { calcQualityScore, generateRecommendations } from './agents/recommendAgent';

export type ProgressCallback = (step: PipelineStep) => void;

const STEPS: Array<{ id: number; name: string }> = [
  { id: 1, name: '構造解析' },
  { id: 2, name: '名前定義抽出' },
  { id: 3, name: '費目認識' },
  { id: 4, name: '整合性チェック' },
  { id: 5, name: '異常値検出' },
  { id: 6, name: '品質スコア・提案生成' },
];

// 少しの遅延を入れてUIの進捗表示を見えるようにする
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 6ステップのエージェントパイプラインを逐次実行
export async function runPipeline(
  workbook: XLSX.WorkBook,
  onProgress: ProgressCallback,
): Promise<AnalysisResult> {
  const emitStep = (id: number, status: PipelineStep['status'], message?: string) => {
    const step = STEPS.find(s => s.id === id)!;
    onProgress({ ...step, status, message });
  };

  // Step 1: 構造解析
  emitStep(1, 'running');
  await delay(200);
  const sheets = structureAgent(workbook);
  emitStep(1, 'done', `${sheets.length}シートを解析`);

  // Step 2: 名前定義抽出
  emitStep(2, 'running');
  await delay(150);
  const namedRanges = namedRangeAgent(workbook);
  emitStep(2, 'done', `${namedRanges.length}件の名前定義を抽出`);

  // Step 3: 費目認識
  emitStep(3, 'running');
  await delay(200);
  const costStructure = costAgent(workbook);
  emitStep(3, 'done', `${costStructure.length}件の費目を認識`);

  // Step 4: 整合性チェック（数式エラー・外部参照・検証式）
  emitStep(4, 'running');
  await delay(200);
  const formulaFindings = formulaAgent(workbook, sheets);
  emitStep(4, 'done', `${formulaFindings.length}件の検出事項`);

  // Step 5: 異常値検出
  emitStep(5, 'running');
  await delay(150);
  const anomalyFindings = anomalyAgent(costStructure);
  emitStep(5, 'done', `${anomalyFindings.length}件の異常値`);

  // Step 6: 品質スコア・提案生成
  emitStep(6, 'running');
  await delay(150);
  const allFindings = [...formulaFindings, ...anomalyFindings];
  const qualityScore = calcQualityScore(allFindings, sheets);
  const recommendations = generateRecommendations(allFindings);
  emitStep(6, 'done', `スコア: ${qualityScore.score}点`);

  return {
    sheets,
    namedRanges,
    costStructure,
    allFindings,
    qualityScore,
    recommendations,
  };
}
