import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import { api } from '../hooks/useApi';

interface SettingsShape {
  instance?: { name?: string; base_url?: string };
  analytics?: { enabled?: boolean };
  security?: { token_expiry_minutes?: number };
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsShape>({});
  const [status, setStatus] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

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

  const doReset = async () => {
    setResetStatus(null);
    setResetError(null);
    if (resetConfirm.trim() !== 'I want to reset my system') {
      setResetError('Confirmation phrase must match exactly.');
      return;
    }
    try {
      await api.post('/api/settings/reset', {
        password: resetPassword,
        confirmation: resetConfirm,
      });
      setResetStatus('System reset to defaults. Seed admin: admin/admin123.');
      setResetPassword('');
      setResetConfirm('');
    } catch (err: any) {
      setResetError(err?.response?.data?.detail || 'Reset failed');
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

      <div className="glass p-4 rounded-xl border border-white/10 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-coral" />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-coral">System reset</p>
            <p className="text-sm text-sand/80">
              This will wipe configs and data in dloper-os-pro (sites, files, backups). Make a backup first.
            </p>
          </div>
        </div>
        <div className="text-xs text-sand/60">
          Type &quot;I want to reset my system&quot; and your password to continue. Seed admin resets to admin/admin123.
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase text-white/70">Password</label>
            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-white/70">Confirmation phrase</label>
            <input
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
              placeholder="I want to reset my system"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-3 rounded-lg bg-coral text-midnight font-semibold disabled:opacity-60"
            onClick={doReset}
            disabled={!resetPassword || resetConfirm.trim() !== 'I want to reset my system'}
          >
            Reset to defaults
          </button>
          <div className="text-xs text-sand/70">Tip: create a backup before resetting.</div>
        </div>
        {resetStatus && <p className="text-sm text-mint">{resetStatus}</p>}
        {resetError && <p className="text-sm text-coral">{resetError}</p>}
      </div>
    </div>
  );
}
