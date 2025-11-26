import { Bell, LogOut } from 'lucide-react';

interface TopBarProps {
  onLogout: () => void;
  user?: { username: string; role?: string } | null;
}

export default function TopBar({ onLogout, user }: TopBarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10 glass sticky top-0 z-10">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-mint">Live</p>
        <h2 className="text-lg font-semibold">DloperOS Pro Dashboard</h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-white/10" title="Alerts">
          <Bell size={18} />
        </button>
        <div className="px-3 py-2 rounded-lg bg-white/5 text-sm">
          <p className="font-semibold">{user?.username || 'guest'}</p>
          <p className="text-xs text-sand/70">{user?.role || 'viewer'}</p>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-2 rounded-lg bg-coral text-midnight font-semibold hover:opacity-90"
        >
          <div className="flex items-center gap-2">
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
}
