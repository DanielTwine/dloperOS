import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Download, AlertCircle, Info } from 'lucide-react';
import { api, API_BASE } from '../hooks/useApi';

interface ShareMeta {
  id: string;
  filename: string;
  filesize: number;
  content_type: string;
  expires_at?: string | null;
  max_downloads?: number | null;
  download_count: number;
  password_protected: boolean;
  active?: boolean;
}

function formatSize(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}

export default function Share() {
  const { fileId } = useParams();
  const [meta, setMeta] = useState<ShareMeta | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const fetchMeta = async () => {
    if (!fileId) return;
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await api.get(`/files/${fileId}/meta`, {
        params: password ? { password } : {},
      });
      setMeta(res.data);
      const requires = Boolean(res.data.password_protected);
      setNeedsPassword(requires);
      setStatus(requires ? 'Password required' : 'Link unlocked');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (err?.response?.status === 401) {
        setNeedsPassword(true);
        setError(detail || 'Password required');
        setStatus(null);
      } else if (err?.response?.status === 404) {
        setError(detail || 'File not found or sharing disabled');
        setNeedsPassword(false);
        setStatus(null);
      } else {
        setError(detail || 'Unable to load file');
        setNeedsPassword(true);
        setStatus(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try once without password to detect if it is public; if it fails, form stays visible
    fetchMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const download = () => {
    if (!fileId) return;
    const url = `${API_BASE.replace(/\/$/, '')}/files/${fileId}${password ? `?password=${encodeURIComponent(password)}` : ''}`;
    window.open(url, '_blank');
  };

  const expiredLabel = meta?.expires_at ? new Date(meta.expires_at).toLocaleString() : 'No expiry';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-midnight text-sand">
      <div className="max-w-2xl w-full glass rounded-2xl border border-white/10 p-8 shadow-glow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-mint/10 text-mint">
                <Shield size={22} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-mint">dloper SmartShare</p>
                <h1 className="text-2xl font-semibold">Secure file access</h1>
              </div>
            </div>

        {error && (
          <div className="flex items-center gap-2 text-coral text-sm mb-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {status && !error && (
          <div className="flex items-center gap-2 text-mint text-sm mb-3">
            <AlertCircle size={16} className="text-mint" /> {status}
          </div>
        )}

        {meta && meta.active === false && (
          <div className="text-sm text-sand/70 mb-3">Sharing has been disabled for this file.</div>
        )}

        {!meta && !loading && (
          <div className="space-y-3 mb-3">
            <div className="text-sm text-sand/70">No file details yet. {error ? '' : 'Click unlock to retry.'}</div>
            <button
              className="px-4 py-3 rounded-lg bg-mint text-midnight font-semibold"
              onClick={fetchMeta}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        {needsPassword && (
          <div className="space-y-3">
            <p className="text-sm text-sand/80">
              This file is protected. Enter the password to view details and download.
            </p>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-mint"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-3 rounded-lg bg-mint text-midnight font-semibold w-full"
                onClick={fetchMeta}
                disabled={loading}
              >
                {loading ? 'Checking…' : 'Unlock file'}
              </button>
            </div>
          </div>
        )}

        {!needsPassword && meta && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-sand/70">Filename</p>
                <p className="text-lg font-semibold">{meta.filename}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-white/10">{meta.content_type}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    meta.password_protected ? 'bg-coral/20 text-coral' : 'bg-mint/10 text-mint'
                  }`}
                >
                  {meta.password_protected ? 'Protected' : 'Public'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-sand/80">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-mint" /> Size: {formatSize(meta.filesize)}
              </div>
              <div>Expires: {expiredLabel}</div>
              <div>Downloads: {meta.download_count}</div>
              <div>Max downloads: {meta.max_downloads ? meta.max_downloads : 'Unlimited'}</div>
            </div>

            <div className="space-y-2">
              {meta.password_protected && (
                <div className="text-xs text-sand/70">
                  Password accepted; you can download with this session.
                </div>
              )}
              <button
                className="w-full px-4 py-3 rounded-lg bg-mint text-midnight font-semibold flex items-center gap-2 justify-center"
                onClick={download}
                disabled={meta.active === false}
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
