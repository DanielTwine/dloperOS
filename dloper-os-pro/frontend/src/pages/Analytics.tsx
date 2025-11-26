import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../hooks/useApi';
import { Website } from '../types';

interface ChartPoint {
  name: string;
  requests: number;
  errors: number;
  bandwidth: number;
}

export default function Analytics() {
  const [points, setPoints] = useState<ChartPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/websites');
        const mapped = (res.data as Website[]).map((site) => ({
          name: site.name,
          requests: site.analytics?.requests ?? 0,
          errors: site.analytics?.errors ?? 0,
          bandwidth: site.analytics?.bandwidth_mb ?? 0,
        }));
        setPoints(mapped);
      } catch {
        setPoints([
          { name: 'sample-site', requests: 1200, errors: 4, bandwidth: 320 },
          { name: 'docs', requests: 640, errors: 2, bandwidth: 90 },
        ]);
      }
    };

    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-mint">Analytics</p>
        <h2 className="text-2xl font-semibold">Per-site requests, errors, bandwidth</h2>
        <p className="text-sm text-sand/70">API driven so the portal can evolve into full observability.</p>
      </div>

      <div className="glass rounded-xl p-4 border border-white/10 h-72">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Requests vs errors</h3>
          <span className="text-xs text-sand/60">pulls from /api/websites analytics</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#cbd5f5" tickLine={false} axisLine={false} />
            <YAxis stroke="#cbd5f5" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#0f162e', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Bar dataKey="requests" fill="#64ffd3" radius={[6, 6, 0, 0]} />
            <Bar dataKey="errors" fill="#f45b69" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="glass p-4 rounded-xl border border-white/10">
          <h3 className="font-semibold mb-2">Bandwidth (MB)</h3>
          <ul className="space-y-2 text-sm">
            {points.map((p) => (
              <li key={p.name} className="flex items-center justify-between">
                <span>{p.name}</span>
                <span className="text-mint font-semibold">{p.bandwidth} MB</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass p-4 rounded-xl border border-white/10">
          <h3 className="font-semibold mb-2">Error rate</h3>
          <ul className="space-y-2 text-sm">
            {points.map((p) => {
              const rate = p.requests ? ((p.errors / p.requests) * 100).toFixed(2) : '0';
              return (
                <li key={p.name} className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <span className="text-coral font-semibold">{rate}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
