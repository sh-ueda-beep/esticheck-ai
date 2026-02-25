import * as XLSX from 'xlsx';
import type { Finding, Sheet } from '../types';
import { getFormulaCells } from '../utils';

// Excel エラー値パターン
const ERROR_VALUES = ['#REF!', '#DIV/0!', '#VALUE!', '#N/A', '#NAME?', '#NULL!'];

// 外部ブック参照パターン: [ブック名]シート名!セル
const EXTERNAL_REF_RE = /\[([^\]]+)\]([^!]+)![A-Z$]+\d+/g;

// 手動検証式パターン: IF(..., "計算間違い" or "エラー" ...)
const MANUAL_CHECK_RE = /IF\s*\([^)]*[,"](計算間違い|エラー|ERROR|error)/i;

// 数式エラー検出エージェント
export function formulaAgent(workbook: XLSX.WorkBook, sheets: Sheet[]): Finding[] {
  const findings: Finding[] = [];

  for (const sheetInfo of sheets) {
    const ws = workbook.Sheets[sheetInfo.name];
    if (!ws) continue;
    const ref = ws['!ref'];
    if (!ref) continue;
    const range = XLSX.utils.decode_range(ref);

    let sheetErrorCount = 0;

    // 全セル走査: エラー値の検出
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr];
        if (!cell) continue;

        // セル値がエラー値かチェック
        if (cell.t === 'e' || (typeof cell.v === 'string' && ERROR_VALUES.some(e => cell.v === e))) {
          const errorVal = cell.w || cell.v || 'エラー';
          findings.push({
            type: 'formula-error',
            severity: '重大',
            message: `${errorVal} エラー`,
            detail: `セル ${addr} に ${errorVal} が検出されました`,
            sheet: sheetInfo.name,
            cell: addr,
            row: r + 1,
          });
          sheetErrorCount++;
        }
      }
    }

    // 数式走査: 外部参照・手動検証式の検出
    const formulaCells = getFormulaCells(ws);
    for (const fc of formulaCells) {
      // 外部ブック参照検出
      const extMatches = fc.formula.matchAll(new RegExp(EXTERNAL_REF_RE.source, EXTERNAL_REF_RE.flags));
      for (const m of extMatches) {
        findings.push({
          type: 'external-ref',
          severity: '警告',
          message: `外部ブック参照: [${m[1]}]${m[2]}`,
          detail: `セル ${fc.cell} の数式に外部ブック参照が含まれています: ${m[0]}`,
          sheet: sheetInfo.name,
          cell: fc.cell,
        });
      }

      // 手動検証式検出
      if (MANUAL_CHECK_RE.test(fc.formula)) {
        findings.push({
          type: 'manual-check',
          severity: '情報',
          message: '手動検証式を検出',
          detail: `セル ${fc.cell} に手動検証IF文が含まれています: ${fc.formula.substring(0, 80)}`,
          sheet: sheetInfo.name,
          cell: fc.cell,
        });
      }
    }

    // シートのエラー数を更新
    sheetInfo.errorCount = sheetErrorCount;
  }

  return findings;
}
