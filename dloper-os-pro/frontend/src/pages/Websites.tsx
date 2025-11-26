import { useEffect, useState } from 'react';
import { Globe2, Plus, ShieldCheck } from 'lucide-react';
import { api } from '../hooks/useApi';
import { Website } from '../types';

export default function Websites() {
  const [sites, setSites] = useState<Website[]>([]);
  const [name, setName] = useState('demo-site');
  const [domains, setDomains] = useState('demo.local');
  const [sslEnabled, setSslEnabled] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      const res = await api.get('/api/websites');
      setSites(res.data);
    } catch {
      setSites([
        {
          name: 'sample-site',
          root_path: 'data/sites/sample-site',
          domains: ['sample.local'],
          ssl_enabled: false,
          analytics: { requests: 32, errors: 1, bandwidth_mb: 120 },
        },
      ]);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const createSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      await api.post('/api/websites', {
        name,
        domains: domains.split(',').map((d) => d.trim()).filter(Boolean),
        ssl_enabled: sslEnabled,
      });
      setStatus('Site created');
      fetchSites();
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || 'Unable to create site');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-mint">Websites</p>
          <h2 className="text-2xl font-semibold">NGINX/Caddy ready sites</h2>
          <p className="text-sm text-sand/70">Root folders live in data/sites/&lt;name&gt;.</p>
        </div>
        <ShieldCheck className={sslEnabled ? 'text-mint' : 'text-sand/60'} />
      </div>

      <form className="glass p-4 rounded-xl grid md:grid-cols-4 gap-3 border border-white/10" onSubmit={createSite}>
        <div>
          <label className="text-xs uppercase text-white/70">Site name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase text-white/70">Domains</label>
          <input
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            placeholder="Comma separated"
          />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sslEnabled} onChange={(e) => setSslEnabled(e.target.checked)} />
            Enable SSL
          </label>
          <button className="ml-auto px-4 py-3 rounded-lg bg-mint text-midnight font-semibold flex items-center gap-2">
            <Plus size={16} /> Add site
          </button>
        </div>
        {status && <p className="text-sm text-sand/80 md:col-span-4">{status}</p>}
      </form>

      <div className="grid md:grid-cols-3 gap-3">
        {sites.map((site) => (
          <div key={site.name} className="glass p-4 rounded-xl border border-white/10 card-hover">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe2 size={18} className="text-mint" />
                <h3 className="font-semibold">{site.name}</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                {site.ssl_enabled ? 'SSL on' : 'SSL off'}
              </span>
            </div>
            <p className="text-sm text-sand/70">{site.domains.join(', ') || 'No domains yet'}</p>
            <p className="text-xs text-sand/50 mt-1">{site.root_path}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-sand/70">
              <span>Req: {site.analytics?.requests ?? 0}</span>
              <span>Err: {site.analytics?.errors ?? 0}</span>
              <span>BW: {site.analytics?.bandwidth_mb ?? 0} MB</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
