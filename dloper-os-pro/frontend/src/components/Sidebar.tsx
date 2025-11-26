import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe2,
  FileStack,
  Box,
  BarChart3,
  Archive,
  Settings,
  Users,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/websites', label: 'Websites', icon: Globe2 },
  { to: '/files', label: 'SmartShare', icon: FileStack },
  { to: '/docker', label: 'Docker', icon: Box },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/backups', label: 'Backups', icon: Archive },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/users', label: 'Users', icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 p-4 glass h-screen sticky top-0 hidden md:flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-mint mb-2">DloperOS Pro</p>
        <h1 className="text-xl font-semibold">Control Plane</h1>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition card-hover ${
                  isActive ? 'bg-lagoon/50 text-mint shadow-glow' : 'hover:bg-white/5'
                }`
              }
              end={link.to === '/'}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="text-xs text-sand/70">
        Raspberry Pi 5 • Designed for quick ops & clean insight.
      </div>
    </aside>
  );
}
