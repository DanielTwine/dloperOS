import { useState } from 'react';
import { Shield, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import { api, setAuthToken } from '../hooks/useApi';

interface LoginProps {
  onLogin: (token: string, user?: { username: string; role?: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('admin@example.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const res = await api.post('/api/auth/login', new URLSearchParams({ username, password }));
        const token = res.data.access_token as string;
        setAuthToken(token);
        onLogin(token);
      } else {
        await api.post('/api/auth/register', { username, password, email });
        const res = await api.post('/api/auth/login', new URLSearchParams({ username, password }));
        const token = res.data.access_token as string;
        setAuthToken(token);
        onLogin(token);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-midnight text-sand">
      <div className="max-w-xl w-full glass p-10 rounded-2xl border border-white/10 shadow-glow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-mint/10 text-mint">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-mint">DloperOS Pro</p>
            <h1 className="text-2xl font-semibold">Sign in to the control plane</h1>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg border ${mode === 'login' ? 'border-mint text-mint' : 'border-white/10'}`}
            onClick={() => setMode('login')}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowRight size={16} /> Login
            </div>
          </button>
          <button
            className={`flex-1 py-2 rounded-lg border ${mode === 'register' ? 'border-mint text-mint' : 'border-white/10'}`}
            onClick={() => setMode('register')}
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus size={16} /> Register
            </div>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/70">Email</label>
              <input
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-mint"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/70">Username</label>
            <input
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-mint"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/70">Password</label>
            <input
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-mint"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-white/50 mt-1">Default seed user is admin / admin123</p>
          </div>
          {error && <p className="text-sm text-coral">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-mint text-midnight font-semibold hover:shadow-glow flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 size={18} className="animate-spin" />} {mode === 'login' ? 'Login' : 'Register & Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
