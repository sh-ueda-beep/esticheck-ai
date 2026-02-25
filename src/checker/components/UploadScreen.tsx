import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

interface Props {
  onFileSelected: (file: File) => void;
}

export function UploadScreen({ onFileSelected }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.xlsx')) {
      setError('.xlsx 形式のファイルのみ対応しています');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('ファイルサイズが上限（50MB）を超えています');
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] px-4">
      <h1 className="text-3xl font-bold text-white mb-2">見積 AI チェッカー</h1>
      <p className="text-slate-400 mb-8 text-center max-w-lg">
        契約見積Excelファイル（.xlsx）をアップロードすると、AIエージェントが構造解析・エラー検出・品質スコアリングを自動的に行います。
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full max-w-md h-48 rounded-xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-3 transition-colors
          ${dragOver ? 'border-blue-400 bg-blue-400/10' : 'border-slate-600 hover:border-slate-400 bg-slate-800/50'}
        `}
      >
        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5m-18 0l5.25-5.25a2.25 2.25 0 013.182 0L12 12m0 0l2.568-2.568a2.25 2.25 0 013.182 0L21 12.75" />
        </svg>
        <span className="text-slate-300 text-sm">
          クリックまたはドラッグ＆ドロップで .xlsx ファイルを選択
        </span>
        <span className="text-slate-500 text-xs">最大 50MB</span>
      </div>

      {error && (
        <div className="mt-4 px-4 py-2 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
