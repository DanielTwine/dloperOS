import { useEffect, useState } from 'react';
import { Box, Play, Square, RotateCcw, Rocket } from 'lucide-react';
import { api } from '../hooks/useApi';
import { ContainerSummary } from '../types';

export default function Docker() {
  const [containers, setContainers] = useState<ContainerSummary[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const fetchContainers = async () => {
    try {
      const res = await api.get('/api/docker/containers');
      setContainers(res.data);
    } catch {
      setContainers([
        { id: 'abc123', name: 'wordpress', image: 'wordpress:latest', status: 'running', cpu_percent: 12, memory_percent: 24 },
        { id: 'db456', name: 'postgres', image: 'postgres:15', status: 'exited', cpu_percent: 0, memory_percent: 0 },
      ]);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const operate = async (id: string, action: string) => {
    try {
      await api.post(`/api/docker/containers/${id}`, { action });
      setStatus(`${action} executed`);
      fetchContainers();
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || 'Command failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-mint">Docker</p>
          <h2 className="text-2xl font-semibold">Lightweight container view</h2>
          <p className="text-sm text-sand/70">List, restart, or stop key services.</p>
        </div>
        <Rocket className="text-mint" />
      </div>
      {status && <p className="text-sm text-sand/80">{status}</p>}

      <div className="grid md:grid-cols-2 gap-3">
        {containers.map((c) => (
          <div key={c.id} className="glass p-4 rounded-xl border border-white/10 card-hover">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Box size={18} className="text-mint" />
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-sand/60">{c.image}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'running' ? 'bg-mint/10 text-mint' : 'bg-white/10'}`}>
                {c.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-sand/70 mb-3">
              <span>CPU: {c.cpu_percent ?? 0}%</span>
              <span>Mem: {c.memory_percent ?? 0}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-lg bg-white/5" onClick={() => operate(c.id, 'start')}>
                <Play size={14} />
              </button>
              <button className="px-3 py-2 rounded-lg bg-white/5" onClick={() => operate(c.id, 'stop')}>
                <Square size={14} />
              </button>
              <button className="px-3 py-2 rounded-lg bg-white/5" onClick={() => operate(c.id, 'restart')}>
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
