// シート構造情報
export interface Sheet {
  name: string;
  rows: number;
  cols: number;
  formulaCount: number;
  mergeCount: number;
  cellCount: number;
  crossRefs: CrossRef[];
  complexity: 'low' | 'medium' | 'high';
  errorCount: number;
}

// クロスシート参照
export interface CrossRef {
  fromSheet: string;
  fromCell: string;
  toSheet: string;
  toCell: string;
  formula: string;
}

// 名前付き範囲
export interface NamedRange {
  name: string;
  ref: string;
  scope: string;
}

// 費目アイテム
export interface CostItem {
  sheet: string;
  row: number;
  label: string;
  value: number | null;
  formula: string | null;
  category: string;
}

// 重大度
export type Severity = '重大' | '警告' | '情報';

// 検出事項
export interface Finding {
  type: 'formula-error' | 'external-ref' | 'manual-check' | 'anomaly';
  severity: Severity;
  message: string;
  detail: string;
  sheet: string;
  cell?: string;
  row?: number;
}

// 優先度
export type Priority = '高' | '中' | '低' | '情報';

// 改善提案
export interface Recommendation {
  priority: Priority;
  title: string;
  description: string;
  action: string;
  impact: string;
}

// 品質スコア
export interface QualityScore {
  score: number;
  breakdown: {
    base: number;
    criticalPenalty: number;
    warningPenalty: number;
    infoPenalty: number;
    structuralPenalty: number;
  };
}

// パイプラインステップ
export interface PipelineStep {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'done';
  message?: string;
}

// 解析結果全体
export interface AnalysisResult {
  sheets: Sheet[];
  namedRanges: NamedRange[];
  costStructure: CostItem[];
  allFindings: Finding[];
  qualityScore: QualityScore;
  recommendations: Recommendation[];
}
