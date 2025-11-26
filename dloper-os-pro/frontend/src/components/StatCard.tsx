interface StatCardProps {
  title: string;
  value: string;
  sublabel?: string;
  tone?: 'mint' | 'coral' | 'sand';
}

const toneMap: Record<string, string> = {
  mint: 'text-mint bg-mint/10',
  coral: 'text-coral bg-coral/10',
  sand: 'text-sand bg-white/5',
};

export default function StatCard({ title, value, sublabel, tone = 'sand' }: StatCardProps) {
  return (
    <div className={`glass p-4 rounded-xl border border-white/10 card-hover ${toneMap[tone]}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-white/70">{title}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
      {sublabel && <p className="text-sm text-white/70 mt-1">{sublabel}</p>}
    </div>
  );
}
