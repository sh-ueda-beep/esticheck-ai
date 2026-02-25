import * as XLSX from 'xlsx';

// ファイルを ArrayBuffer として読み込み、SheetJS Workbook に変換
export function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, {
          type: 'array',
          cellFormula: true,  // 数式文字列を取得
          cellStyles: false,
          sheetStubs: true,   // 空セルも含める
        });
        resolve(workbook);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsArrayBuffer(file);
  });
}

// シートの使用範囲（行数・列数）を取得
export function getSheetDimensions(sheet: XLSX.WorkSheet): { rows: number; cols: number } {
  const ref = sheet['!ref'];
  if (!ref) return { rows: 0, cols: 0 };
  const range = XLSX.utils.decode_range(ref);
  return {
    rows: range.e.r - range.s.r + 1,
    cols: range.e.c - range.s.c + 1,
  };
}

// シート内の全セルを走査し、数式セルを収集
export function getFormulaCells(sheet: XLSX.WorkSheet): Array<{ cell: string; formula: string; value: unknown }> {
  const results: Array<{ cell: string; formula: string; value: unknown }> = [];
  const ref = sheet['!ref'];
  if (!ref) return results;
  const range = XLSX.utils.decode_range(ref);

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      if (cell && cell.f) {
        results.push({ cell: addr, formula: cell.f, value: cell.v });
      }
    }
  }
  return results;
}

// シート内の結合セル数を取得
export function getMergeCount(sheet: XLSX.WorkSheet): number {
  return sheet['!merges']?.length ?? 0;
}

// セルアドレスからセル値を取得
export function getCellValue(sheet: XLSX.WorkSheet, row: number, col: number): unknown {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = sheet[addr];
  return cell?.v ?? null;
}

// セルの文字列値を取得
export function getCellText(sheet: XLSX.WorkSheet, row: number, col: number): string {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  const cell = sheet[addr];
  if (!cell) return '';
  if (cell.w) return cell.w;
  if (cell.v != null) return String(cell.v);
  return '';
}
