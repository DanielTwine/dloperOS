import { useEffect, useMemo, useState } from 'react';
import { Globe2, Plus, ShieldCheck, Search, FolderTree, FileText, Upload, RefreshCcw } from 'lucide-react';
import { api } from '../hooks/useApi';
import { Website } from '../types';

type SiteFile = { path: string; size: number };

export default function Websites() {
  const [sites, setSites] = useState<Website[]>([]);
  const [name, setName] = useState('demo-site');
  const [domains, setDomains] = useState('demo.local');
  const [sslEnabled, setSslEnabled] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState<Website | null>(null);
  const [files, setFiles] = useState<SiteFile[]>([]);
  const [fileStatus, setFileStatus] = useState<string | null>(null);

  const filteredSites = useMemo(
    () => sites.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.domains.join(',').includes(search)),
    [sites, search],
  );

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

  const fetchFiles = async (siteName: string) => {
    setFileStatus('Loading files…');
    try {
      const res = await api.get(`/api/websites/${siteName}/files`);
      setFiles(res.data);
      setFileStatus(null);
    } catch (err: any) {
      setFileStatus(err?.response?.data?.detail || 'Unable to load files');
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

  const openSite = (site: Website) => {
    setSelectedSite(site);
    fetchFiles(site.name);
  };

  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;
    const fileInput = document.getElementById('site-upload') as HTMLInputElement | null;
    if (!fileInput?.files?.[0]) {
      setFileStatus('Choose a file to upload');
      return;
    }
    const data = new FormData();
    data.append('upload', fileInput.files[0]);
    data.append('path', fileInput.files[0].name);
    try {
      await api.post(`/api/websites/${selectedSite.name}/files/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileStatus('Uploaded');
      fetchFiles(selectedSite.name);
    } catch (err: any) {
      setFileStatus(err?.response?.data?.detail || 'Upload failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-mint">Websites</p>
          <h2 className="text-2xl font-semibold">Multi-site manager</h2>
          <p className="text-sm text-sand/70">Root folders live in data/sites/&lt;name&gt;. Map custom domains via Cloudflare/DNS.</p>
        </div>
        <ShieldCheck className={sslEnabled ? 'text-mint' : 'text-sand/60'} />
      </div>

      <form className="glass p-4 rounded-xl grid md:grid-cols-5 gap-3 border border-white/10" onSubmit={createSite}>
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
          <label className="text-xs uppercase text-white/70">Domains (comma separated)</label>
          <input
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            placeholder="site1.com, app.site1.com"
          />
          <p className="text-xs text-sand/60 mt-1">Point DNS (Cloudflare) to your Pi IP and add the domain here.</p>
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
        {status && <p className="text-sm text-sand/80 md:col-span-5">{status}</p>}
      </form>

      <div className="glass p-3 rounded-xl border border-white/10 flex items-center gap-2">
        <Search size={16} className="text-sand/70" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-sand"
          placeholder="Search sites or domains"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {filteredSites.map((site) => (
          <div
            key={site.name}
            className="glass p-4 rounded-xl border border-white/10 card-hover cursor-pointer"
            onClick={() => openSite(site)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe2 size={18} className="text-mint" />
                <h3 className="font-semibold">{site.name}</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                {site.ssl_enabled ? 'SSL on' : 'SSL off'}
              </span>
            </div>
            <p className="text-sm text-sand/70 truncate">{site.domains.join(', ') || 'No domains yet'}</p>
            <p className="text-xs text-sand/50 mt-1">{site.root_path}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-sand/70">
              <span>Req: {site.analytics?.requests ?? 0}</span>
              <span>Err: {site.analytics?.errors ?? 0}</span>
              <span>BW: {site.analytics?.bandwidth_mb ?? 0} MB</span>
            </div>
          </div>
        ))}
      </div>

      {selectedSite && (
        <div className="glass p-4 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-mint">Site workspace</p>
              <h3 className="text-xl font-semibold">{selectedSite.name}</h3>
              <p className="text-xs text-sand/60">{selectedSite.root_path}</p>
            </div>
            <button className="px-3 py-2 rounded-lg bg-white/5 text-xs flex items-center gap-2" onClick={() => fetchFiles(selectedSite.name)}>
              <RefreshCcw size={14} /> Refresh files
            </button>
          </div>
          <div className="flex gap-3 items-center">
            <FolderTree size={16} className="text-mint" />
            <span className="text-sm text-sand/70">Files inside data/sites/{selectedSite.name}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <form onSubmit={uploadFile} className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
              <Upload size={16} className="text-mint" />
              <input id="site-upload" type="file" className="text-sm text-sand/80" />
              <button className="ml-auto px-3 py-2 rounded-lg bg-mint text-midnight text-sm font-semibold">Upload</button>
            </form>
            <div className="text-xs text-sand/70 flex items-center gap-2">
              <FileText size={14} /> Editing & preview integrations can point to this root for each site.
            </div>
          </div>
          {fileStatus && <p className="text-sm text-sand/80">{fileStatus}</p>}
          <div className="max-h-64 overflow-y-auto border border-white/10 rounded-lg p-3 space-y-2 bg-white/5">
            {files.length === 0 && <p className="text-sm text-sand/70">No files yet. Upload your index.html to start.</p>}
            {files.map((f) => (
              <div key={f.path} className="flex items-center justify-between text-sm">
                <span className="truncate">{f.path}</span>
                <span className="text-xs text-sand/60">{(f.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
