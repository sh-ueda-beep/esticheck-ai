import type { Finding, Sheet, QualityScore, Recommendation } from '../types';

// 品質スコア算出
export function calcQualityScore(findings: Finding[], sheets: Sheet[]): QualityScore {
  const criticalCount = findings.filter(f => f.severity === '重大').length;
  const warningCount = findings.filter(f => f.severity === '警告').length;
  const infoCount = findings.filter(f => f.severity === '情報').length;

  const totalMerges = sheets.reduce((sum, s) => sum + s.mergeCount, 0);
  const totalFormulas = sheets.reduce((sum, s) => sum + s.formulaCount, 0);

  const criticalPenalty = criticalCount * 15;
  const warningPenalty = warningCount * 5;
  const infoPenalty = infoCount * 1;
  const structuralPenalty = (totalMerges > 200 ? 5 : 0) + (totalFormulas > 500 ? 3 : 0);

  const raw = 100 - criticalPenalty - warningPenalty - infoPenalty - structuralPenalty;
  const score = Math.max(0, Math.min(100, raw));

  return {
    score,
    breakdown: {
      base: 100,
      criticalPenalty,
      warningPenalty,
      infoPenalty,
      structuralPenalty,
    },
  };
}

// 改善提案生成
export function generateRecommendations(findings: Finding[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. 重大エラー修正
  const criticals = findings.filter(f => f.type === 'formula-error');
  if (criticals.length > 0) {
    const cells = criticals.map(f => `${f.sheet}!${f.cell}`).join(', ');
    recommendations.push({
      priority: '高',
      title: '数式エラーの修正',
      description: `${criticals.length}件の数式エラー（#REF!等）が検出されました。見積金額の正確性に影響する可能性があります。`,
      action: `以下のセルの数式を確認・修正してください: ${cells}`,
      impact: '見積金額の信頼性が向上します',
    });
  }

  // 2. 外部参照解消
  const externals = findings.filter(f => f.type === 'external-ref');
  if (externals.length > 0) {
    recommendations.push({
      priority: '中',
      title: '外部ブック参照の解消',
      description: `${externals.length}件の外部ブック参照が検出されました。ファイル受け渡し時にリンク切れとなるリスクがあります。`,
      action: '外部参照を値貼り付けに変換するか、参照先のデータを同一ブック内にコピーしてください。',
      impact: 'ファイル共有時のリンク切れリスクが解消されます',
    });
  }

  // 3. 手動検証式のチェック自動化
  const manualChecks = findings.filter(f => f.type === 'manual-check');
  if (manualChecks.length > 0) {
    recommendations.push({
      priority: '低',
      title: '手動検証式の自動化検討',
      description: `${manualChecks.length}件の手動検証IF文が検出されました。散在する検証式は網羅的な確認が困難です。`,
      action: '検証ロジックを集約するか、自動チェックツールへの置き換えを検討してください。',
      impact: 'チェック漏れのリスクが低減します',
    });
  }

  // 4. 異常値の確認
  const anomalies = findings.filter(f => f.type === 'anomaly');
  if (anomalies.length > 0) {
    recommendations.push({
      priority: '中',
      title: '費目金額の異常値確認',
      description: `${anomalies.length}件の統計的異常値が検出されました。入力ミスまたは特殊要因の可能性があります。`,
      action: '検出された異常値の妥当性を確認してください。',
      impact: '見積金額の精度が向上します',
    });
  }

  // 5. 検出事項がない場合の肯定的フィードバック
  if (findings.length === 0) {
    recommendations.push({
      priority: '情報',
      title: '良好な品質',
      description: '数式エラー・外部参照・異常値は検出されませんでした。',
      action: '引き続き品質を維持してください。',
      impact: '現在の見積品質は良好です',
    });
  }

  return recommendations;
}
