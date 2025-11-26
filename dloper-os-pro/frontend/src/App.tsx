import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Websites from './pages/Websites';
import Files from './pages/Files';
import Docker from './pages/Docker';
import Analytics from './pages/Analytics';
import Backups from './pages/Backups';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Login from './pages/Login';
import Share from './pages/Share';
import { api, setAuthToken } from './hooks/useApi';
import { User } from './types';

export default function App() {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dloper_token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem('dloper_token', token);
      api
        .get('/api/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    } else {
      localStorage.removeItem('dloper_token');
      setUser(null);
    }
  }, [token]);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  const authed = Boolean(token);

  if (location.pathname.startsWith('/share/')) {
    return <Share />;
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-transparent text-sand">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar onLogout={handleLogout} user={user || { username: 'admin', role: 'owner' }} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/websites" element={<Websites />} />
            <Route path="/files" element={<Files />} />
            <Route path="/docker" element={<Docker />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/backups" element={<Backups />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<Users />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
