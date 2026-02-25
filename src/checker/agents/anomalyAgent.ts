import type { CostItem, Finding } from '../types';

// カテゴリ別に平均・標準偏差を算出し、±2σ超の異常値を検出
export function anomalyAgent(costStructure: CostItem[]): Finding[] {
  const findings: Finding[] = [];

  // カテゴリ別にグループ化（値がnullのものは除外）
  const groups = new Map<string, CostItem[]>();
  for (const item of costStructure) {
    if (item.value == null) continue;
    const existing = groups.get(item.category) ?? [];
    existing.push(item);
    groups.set(item.category, existing);
  }

  for (const [category, items] of groups) {
    // 2件未満は統計比較不可
    if (items.length < 2) continue;

    const values = items.map(i => i.value!);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
    const stddev = Math.sqrt(variance);

    // 標準偏差が0（全て同値）の場合はスキップ
    if (stddev === 0) continue;

    for (const item of items) {
      const deviation = Math.abs(item.value! - mean);
      if (deviation > stddev * 2) {
        findings.push({
          type: 'anomaly',
          severity: '警告',
          message: `${category}の異常値を検出`,
          detail: `${item.sheet} 行${item.row}: ${item.label} = ${item.value!.toLocaleString()}円（平均 ${Math.round(mean).toLocaleString()}円から ${Math.round(deviation).toLocaleString()}円乖離）`,
          sheet: item.sheet,
          row: item.row,
        });
      }
    }
  }

  return findings;
}
