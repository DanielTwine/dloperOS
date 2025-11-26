import { useEffect, useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { api } from '../hooks/useApi';
import { User } from '../types';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('ops');
  const [email, setEmail] = useState('ops@example.com');
  const [password, setPassword] = useState('changeme');
  const [role, setRole] = useState('viewer');
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch {
      setUsers([{ username: 'admin', email: 'admin@example.com', role: 'owner' }]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/users', { username, email, password, role });
      setStatus('User created');
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || 'Create failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-mint">Users</p>
          <h2 className="text-2xl font-semibold">Roles & access</h2>
        </div>
        <ShieldCheck className="text-mint" />
      </div>

      <form className="glass p-4 rounded-xl border border-white/10 grid md:grid-cols-5 gap-3 items-end" onSubmit={create}>
        <div>
          <label className="text-xs uppercase text-white/70">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase text-white/70">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            type="email"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase text-white/70">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase text-white/70">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3"
          >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <button className="px-4 py-3 rounded-lg bg-mint text-midnight font-semibold flex items-center gap-2">
          <Plus size={16} /> Add user
        </button>
        {status && <p className="text-sm text-sand/80 md:col-span-5">{status}</p>}
      </form>

      <div className="grid md:grid-cols-3 gap-3">
        {users.map((u) => (
          <div key={u.username} className="glass p-4 rounded-xl border border-white/10 card-hover">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{u.username}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10">{u.role}</span>
            </div>
            <p className="text-sm text-sand/70">{u.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
