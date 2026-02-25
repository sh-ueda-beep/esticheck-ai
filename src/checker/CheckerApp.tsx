import { useState, useCallback } from 'react';
import type { AnalysisResult, PipelineStep } from './types';
import { readWorkbook } from './utils';
import { runPipeline } from './pipeline';
import { UploadScreen } from './components/UploadScreen';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { Dashboard } from './components/Dashboard';

type Phase = 'upload' | 'analyzing' | 'dashboard';

export function CheckerApp() {
  const [phase, setPhase] = useState<Phase>('upload');
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addLog = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString('ja-JP');
    setLogs(prev => [...prev, `[${time}] ${message}`]);
  }, []);

  const handleFileSelected = useCallback(async (file: File) => {
    setPhase('analyzing');
    setSteps([]);
    setLogs([]);
    setError(null);

    addLog(`ファイル読み込み開始: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`);

    try {
      const workbook = await readWorkbook(file);
      addLog(`Workbook読み込み完了: ${workbook.SheetNames.length}シート検出`);
      addLog(`シート名: ${workbook.SheetNames.join(', ')}`);

      const analysisResult = await runPipeline(workbook, (step) => {
        setSteps(prev => {
          const existing = prev.findIndex(s => s.id === step.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = step;
            return updated;
          }
          return [...prev, step];
        });

        if (step.status === 'running') {
          addLog(`Step ${step.id} 開始: ${step.name}`);
        }
        if (step.status === 'done' && step.message) {
          addLog(`Step ${step.id} 完了: ${step.name} — ${step.message}`);
        }
      });

      addLog('全ステップ完了');
      setResult(analysisResult);

      // 少し待ってからダッシュボードに遷移
      setTimeout(() => setPhase('dashboard'), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ファイルの解析に失敗しました';
      setError(message);
      addLog(`エラー: ${message}`);
    }
  }, [addLog]);

  const handleReset = useCallback(() => {
    setPhase('upload');
    setSteps([]);
    setLogs([]);
    setResult(null);
    setError(null);
  }, []);

  if (phase === 'upload') {
    return <UploadScreen onFileSelected={handleFileSelected} />;
  }

  if (phase === 'analyzing') {
    return (
      <div>
        <AnalyzingScreen steps={steps} logs={logs} />
        {error && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-900 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
            <button onClick={handleReset} className="ml-3 underline">やり直す</button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'dashboard' && result) {
    return <Dashboard result={result} onReset={handleReset} />;
  }

  return null;
}
