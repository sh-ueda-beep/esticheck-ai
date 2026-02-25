import * as XLSX from 'xlsx';
import type { CostItem } from '../types';
import { getCellText, getCellValue } from '../utils';

// 費目キーワードとカテゴリのマッピング
const COST_KEYWORDS: Array<{ keyword: string; category: string }> = [
  { keyword: '直接材料費', category: '直接材料費' },
  { keyword: '直材', category: '直接材料費' },
  { keyword: '加工費', category: '加工費' },
  { keyword: '設計費', category: '設計費' },
  { keyword: '試験費', category: '試験費' },
  { keyword: '出張費', category: '出張費' },
  { keyword: '梱包輸送費', category: '梱包輸送費' },
  { keyword: '梱包費', category: '梱包輸送費' },
  { keyword: '輸送費', category: '梱包輸送費' },
  { keyword: '雑費', category: '雑費' },
  { keyword: '製造原価', category: '製造原価' },
  { keyword: '工場原価', category: '工場原価' },
  { keyword: '総原価', category: '総原価' },
  { keyword: '一般管理費', category: '一般管理費' },
  { keyword: 'GC', category: '一般管理費' },
  { keyword: '利益', category: '利益' },
  { keyword: 'IP', category: '利益' },
  { keyword: '直接経費', category: '直接経費' },
];

// 先頭120行×10列をスキャンするスキャン範囲
const SCAN_ROWS = 120;
const SCAN_COLS = 10;

// 費目構造認識エージェント
export function costAgent(workbook: XLSX.WorkBook): CostItem[] {
  const items: CostItem[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    if (!ws) continue;

    for (let r = 0; r < SCAN_ROWS; r++) {
      for (let c = 0; c < SCAN_COLS; c++) {
        const text = getCellText(ws, r, c);
        if (!text) continue;

        // キーワードマッチ（部分一致）
        const matched = COST_KEYWORDS.find(k => text.includes(k.keyword));
        if (!matched) continue;

        // 右方向に数値セルを探す
        let value: number | null = null;
        let formula: string | null = null;
        for (let nc = c + 1; nc < c + 11 && nc < 100; nc++) {
          const v = getCellValue(ws, r, nc);
          if (typeof v === 'number') {
            value = v;
            const addr = XLSX.utils.encode_cell({ r, c: nc });
            const cell = ws[addr];
            formula = cell?.f ?? null;
            break;
          }
        }

        items.push({
          sheet: sheetName,
          row: r + 1,
          label: text.trim(),
          value,
          formula,
          category: matched.category,
        });
      }
    }
  }

  return items;
}
