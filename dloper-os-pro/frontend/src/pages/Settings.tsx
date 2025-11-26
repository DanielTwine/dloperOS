import { useEffect, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { api } from '../hooks/useApi';

interface SettingsShape {
  instance?: { name?: string; base_url?: string };
  analytics?: { enabled?: boolean };
  security?: { token_expiry_minutes?: number };
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsShape>({});
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get('/api/settings');
      setSettings(res.data);
    } catch {
      setSettings({ instance: { name: 'DloperOS Pro', base_url: 'http://localhost:8000' } });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async () => {
    try {
      await api.put('/api/settings', {
        name: settings.instance?.name,
        base_url: settings.instance?.base_url,
        analytics_enabled: settings.analytics?.enabled,
        token_expiry_minutes: settings.security?.token_expiry_minutes,
      });
      setStatus('Saved');
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || 'Update failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-mint">Settings</p>
          <h2 className="text-2xl font-semibold">Portal defaults</h2>
        </div>
        <SettingsIcon className="text-mint" />
      </div>

      <div className="glass p-4 rounded-xl border border-white/10 grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase text-white/70">Instance name</label>
          <input
            value={settings.instance?.name || ''}
            onChange={(e) => setSettings({ ...settings, instance: { ...settings.instance, name: e.target.value } })}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-white/70">Base URL</label>
          <input
            value={settings.instance?.base_url || ''}
            onChange={(e) => setSettings({ ...settings, instance: { ...settings.instance, base_url: e.target.value } })}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-white/70">Analytics</label>
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input
              type="checkbox"
              checked={settings.analytics?.enabled ?? false}
              onChange={(e) => setSettings({ ...settings, analytics: { enabled: e.target.checked } })}
            />
            Enable per-site analytics
          </label>
        </div>
        <div>
          <label className="text-xs uppercase text-white/70">Token expiry (minutes)</label>
          <input
            type="number"
            value={settings.security?.token_expiry_minutes || 90}
            onChange={(e) =>
              setSettings({ ...settings, security: { token_expiry_minutes: Number(e.target.value) } })
            }
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <button className="px-4 py-3 rounded-lg bg-mint text-midnight font-semibold" onClick={update}>
            Save settings
          </button>
          {status && <p className="text-sm text-sand/80">{status}</p>}
        </div>
      </div>
    </div>
  );
}
