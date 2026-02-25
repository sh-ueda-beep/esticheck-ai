import * as XLSX from 'xlsx';
import type { Sheet, CrossRef } from '../types';
import { getSheetDimensions, getFormulaCells, getMergeCount } from '../utils';

// クロスシート参照を検出する正規表現（シート名!セル参照）
const CROSS_REF_RE = /(?:'([^']+)'|([A-Za-z\u3000-\u9FFF\uFF00-\uFFEF][\w\u3000-\u9FFF\uFF00-\uFFEF]*))!(\$?[A-Z]+\$?\d+)/g;

// 数式からクロスシート参照を抽出
function extractCrossRefs(sheetName: string, cell: string, formula: string): CrossRef[] {
  const refs: CrossRef[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(CROSS_REF_RE.source, CROSS_REF_RE.flags);
  while ((match = re.exec(formula)) !== null) {
    const toSheet = match[1] || match[2];
    const toCell = match[3];
    if (toSheet !== sheetName) {
      refs.push({ fromSheet: sheetName, fromCell: cell, toSheet, toCell, formula });
    }
  }
  return refs;
}

// 複雑度判定（数式100超=高、30超=中、それ以外=低）
function calcComplexity(formulaCount: number): 'low' | 'medium' | 'high' {
  if (formulaCount > 100) return 'high';
  if (formulaCount > 30) return 'medium';
  return 'low';
}

// シート構造解析エージェント
export function structureAgent(workbook: XLSX.WorkBook): Sheet[] {
  return workbook.SheetNames.map((name) => {
    const ws = workbook.Sheets[name];
    const { rows, cols } = getSheetDimensions(ws);
    const formulaCells = getFormulaCells(ws);
    const mergeCount = getMergeCount(ws);

    // クロスシート参照を全数式から抽出
    const crossRefs: CrossRef[] = [];
    for (const fc of formulaCells) {
      crossRefs.push(...extractCrossRefs(name, fc.cell, fc.formula));
    }

    return {
      name,
      rows,
      cols,
      formulaCount: formulaCells.length,
      mergeCount,
      cellCount: rows * cols,
      crossRefs,
      complexity: calcComplexity(formulaCells.length),
      errorCount: 0, // formulaAgent で後から更新
    };
  });
}
