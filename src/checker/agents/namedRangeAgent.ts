import type * as XLSX from 'xlsx';
import type { NamedRange } from '../types';

// 名前付き範囲抽出エージェント
export function namedRangeAgent(workbook: XLSX.WorkBook): NamedRange[] {
  const names = workbook.Workbook?.Names;
  if (!names || !Array.isArray(names)) return [];

  return names.map((n) => ({
    name: n.Name ?? '',
    ref: n.Ref ?? '',
    scope: n.Sheet != null ? (workbook.SheetNames[n.Sheet] ?? 'Workbook') : 'Workbook',
  }));
}
