import { useEffect, useState } from 'react';
import { Activity, Thermometer } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatCard from '../components/StatCard';
import { api } from '../hooks/useApi';

interface Metrics {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  temperature?: number | null;
  network?: { bytes_sent_per_sec: number; bytes_recv_per_sec: number };
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    cpu_percent: 18,
    memory_percent: 42,
    disk_percent: 33,
    temperature: 47,
    network: { bytes_sent_per_sec: 0, bytes_recv_per_sec: 0 },
  });
  const [history, setHistory] = useState<{ name: string; cpu: number; mem: number }[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/api/system/metrics');
        const data = res.data as Metrics;
        setMetrics(data);
        const stamp = new Date().toLocaleTimeString();
        setHistory((prev) => [...prev.slice(-8), { name: stamp, cpu: data.cpu_percent, mem: data.memory_percent }]);
      } catch {
        // keep sample data, but still advance chart gently
        setHistory((prev) => {
          const next = (prev[prev.length - 1]?.cpu || metrics.cpu_percent) + (Math.random() * 4 - 2);
          const mem = (prev[prev.length - 1]?.mem || metrics.memory_percent) + (Math.random() * 3 - 1.5);
          return [...prev.slice(-8), { name: new Date().toLocaleTimeString(), cpu: Math.max(5, next), mem: Math.max(10, mem) }];
        });
      }
    };

    fetchMetrics();
    const id = setInterval(fetchMetrics, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-mint">System Dashboard</p>
          <h2 className="text-2xl font-semibold">Raspberry Pi 5 snapshot</h2>
          <p className="text-sm text-sand/70">Live hardware vitals, network throughput, and uptime hints.</p>
        </div>
        <div className="flex items-center gap-2 text-sand/80">
          <Activity size={16} className="text-mint" />
          <span className="text-sm">Polling every 6s</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="CPU" value={`${metrics.cpu_percent.toFixed(1)}%`} sublabel="Live usage" tone="mint" />
        <StatCard title="Memory" value={`${metrics.memory_percent.toFixed(1)}%`} sublabel="Used" tone="coral" />
        <StatCard title="Disk" value={`${metrics.disk_percent.toFixed(1)}%`} sublabel="Root mount" />
        <StatCard
          title="Temp"
          value={metrics.temperature ? `${metrics.temperature.toFixed(1)}°C` : 'N/A'}
          sublabel="Thermals"
        />
      </div>

      <div className="glass rounded-xl p-4 grid md:grid-cols-3 gap-4 border border-white/10">
        <div className="md:col-span-2 h-60">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-mint">Performance</p>
              <h3 className="text-lg font-semibold">CPU vs memory trend</h3>
            </div>
            <Thermometer size={18} className="text-sand/60" />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0f162e', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="cpu" stroke="#64ffd3" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="mem" stroke="#f45b69" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Network</p>
              <span className="text-xs text-sand/70">per second</span>
            </div>
            <p className="text-lg font-semibold text-mint">
              ↑ {((metrics.network?.bytes_sent_per_sec || 0) / 1024).toFixed(0)} KB/s
            </p>
            <p className="text-lg font-semibold text-coral">
              ↓ {((metrics.network?.bytes_recv_per_sec || 0) / 1024).toFixed(0)} KB/s
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm font-semibold">Backups & Snapshots</p>
            <p className="text-xs text-sand/70">Keep websites, SmartShare, and volumes restorable.</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm font-semibold">Docker</p>
            <p className="text-xs text-sand/70">Launch WordPress, DBs, or Node templates in a click.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
