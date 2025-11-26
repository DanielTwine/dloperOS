import { useEffect, useState } from 'react';
import { Upload, Link2, Shield, Pause, Play, Trash2 } from 'lucide-react';
import { api } from '../hooks/useApi';
import { SharedFile } from '../types';

export default function Files() {
  const [records, setRecords] = useState<SharedFile[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [maxDownloads, setMaxDownloads] = useState<number | undefined>();
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/api/files');
      setRecords(res.data);
    } catch {
      setRecords([
        {
          id: 'demo123',
          filename: 'launch-notes.pdf',
          path: 'data/files/demo123/launch-notes.pdf',
          password_protected: true,
          download_count: 4,
          share_url: 'https://files.local/demo123',
          owner: 'admin',
        },
      ]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus('Choose a file first');
      return;
    }
    setLoading(true);
    const data = new FormData();
    data.append('upload', file);
    if (password) data.append('password', password);
    if (maxDownloads) data.append('max_downloads', String(maxDownloads));
    if (expiresAt) data.append('expires_at', expiresAt);

    try {
      await api.post('/api/files/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('Uploaded');
      setFile(null);
      setPassword('');
      setMaxDownloads(undefined);
      setExpiresAt('');
      await fetchFiles();
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleShare = async (id: string, active: boolean) => {
    try {
      await api.put(`/api/files/${id}`, { active });
      setStatus(active ? 'Link enabled' : 'Sharing stopped');
      fetchFiles();
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || 'Update failed');
    }
  };

  const removeFile = async (id: string) => {
    try {
      await api.delete(`/api/files/${id}`);
      setStatus('File removed');
      fetchFiles();
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || 'Delete failed');
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-mint">dloper SmartShare</p>
          <h2 className="text-2xl font-semibold">File vault with on/off sharing</h2>
          <p className="text-sm text-sand/70">Store files locally (data/files/&lt;id&gt;) and flip links on or off anytime.</p>
        </div>
        <Shield className="text-mint" />
      </div>

      <form className="glass p-4 rounded-xl border border-white/10 grid md:grid-cols-5 gap-3 items-end" onSubmit={uploadFile}>
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-white/70">File</label>
          <input type="file" className="mt-1 w-full" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="text-xs uppercase text-white/70">Password (optional)</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            placeholder="protect downloads"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-white/70">Max downloads</label>
          <input
            value={maxDownloads ?? ''}
            onChange={(e) => setMaxDownloads(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            type="number"
            min={1}
          />
        </div>
        <div>
          <label className="text-xs uppercase text-white/70">Expires at</label>
          <input
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            type="datetime-local"
          />
        </div>
        <button className="px-4 py-3 rounded-lg bg-mint text-midnight font-semibold flex items-center gap-2" disabled={loading}>
          <Upload size={16} /> {loading ? 'Uploading…' : 'Upload'}
        </button>
        {status && <p className="text-sm text-sand/80 md:col-span-5">{status}</p>}
      </form>

      <div className="grid md:grid-cols-3 gap-3">
        {records.map((fileRec) => (
          <div key={fileRec.id} className="glass p-4 rounded-xl border border-white/10 card-hover">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Link2 size={18} className="text-mint" />
                <h3 className="font-semibold">{fileRec.filename}</h3>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  fileRec.active === false ? 'bg-white/10 text-sand/70' : 'bg-mint/10 text-mint'
                }`}
              >
                {fileRec.active === false ? 'Link off' : 'Live'}
              </span>
            </div>
            <p className="text-xs text-sand/60 truncate" title={fileRec.path}>
              {fileRec.path}
            </p>
            <div className="text-xs text-sand/70 mt-1">
              {fileRec.password_protected ? 'Protected: password required' : 'Public: no password'}
            </div>
            <div className="text-sm mt-2 flex items-center gap-2">
              <span className="text-sand/70">Downloads:</span>
              <span className="text-mint font-semibold">{fileRec.download_count}</span>
              {fileRec.max_downloads && <span className="text-xs">/ {fileRec.max_downloads}</span>}
            </div>
            <p className="text-xs text-sand/60">Expires: {formatDate(fileRec.expires_at as string)}</p>
            <div className="flex items-center gap-2 mt-3">
              <button
                className="px-3 py-2 rounded-lg bg-white/5 text-xs flex items-center gap-2"
                type="button"
                onClick={() => toggleShare(fileRec.id, !(fileRec.active ?? true))}
              >
                {fileRec.active === false ? (
                  <>
                    <Play size={14} /> Enable link
                  </>
                ) : (
                  <>
                    <Pause size={14} /> Stop sharing
                  </>
                )}
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-white/5 text-xs flex items-center gap-2 text-coral"
                type="button"
                onClick={() => removeFile(fileRec.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
            {(
              <a
                className="text-mint text-xs inline-flex items-center gap-1 mt-2"
                href={`${window.location.origin}/share/${fileRec.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <Link2 size={14} /> {`${window.location.origin}/share/${fileRec.id}`}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
