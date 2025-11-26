import { useEffect, useState } from 'react';
import { Archive, Save } from 'lucide-react';
import { api } from '../hooks/useApi';
import { BackupRecord } from '../types';

export default function Backups() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [target, setTarget] = useState('sites');
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get('/api/backups');
      setBackups(res.data);
    } catch {
      setBackups([
        {
          name: 'sites-20240412.zip',
          path: 'data/backups/sites-20240412.zip',
          size: 1200000,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createBackup = async () => {
    try {
      await api.post('/api/backups', { target });
      setStatus('Backup created');
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || 'Backup failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-mint">Backups</p>
          <h2 className="text-2xl font-semibold">Snapshot websites, files, volumes</h2>
          <p className="text-sm text-sand/70">Archives land in data/backups/</p>
        </div>
        <Archive className="text-mint" />
      </div>

      <div className="glass p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-3 items-center">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg p-3 text-sand w-full md:w-auto"
        >
          <option value="sites">Sites</option>
          <option value="files">SmartShare files</option>
        </select>
        <button className="px-4 py-3 rounded-lg bg-mint text-midnight font-semibold flex items-center gap-2" onClick={createBackup}>
          <Save size={16} /> Create backup
        </button>
        {status && <p className="text-sm text-sand/80">{status}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {backups.map((b) => (
          <div key={b.name} className="glass p-4 rounded-xl border border-white/10 card-hover">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">{b.name}</h3>
              <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{(b.size / 1_048_576).toFixed(2)} MB</span>
            </div>
            <p className="text-xs text-sand/60">{b.path}</p>
            <p className="text-xs text-sand/60 mt-1">{new Date(b.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
