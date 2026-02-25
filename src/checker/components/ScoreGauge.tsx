import { PieChart, Pie, Cell } from 'recharts';

interface Props {
  score: number;
}

function getColor(score: number): string {
  if (score >= 80) return '#22c55e'; // 緑
  if (score >= 60) return '#eab308'; // 黄
  return '#ef4444'; // 赤
}

export function ScoreGauge({ score }: Props) {
  const color = getColor(score);
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <PieChart width={160} height={160}>
        <Pie
          data={data}
          cx={80}
          cy={80}
          innerRadius={55}
          outerRadius={70}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
        >
          <Cell fill={color} />
          <Cell fill="#334155" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color }}>{score}</div>
          <div className="text-xs text-slate-400">/ 100</div>
        </div>
      </div>
      <div className="text-sm text-slate-300 mt-1">品質スコア</div>
    </div>
  );
}
