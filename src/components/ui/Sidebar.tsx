import { NavLink } from 'react-router-dom';
import { CalendarDays, Scissors, FileText, Upload, ClipboardList, Settings, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';

const customerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/services', label: 'Services', icon: Scissors },
];
const staffLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/services', label: 'Services', icon: Scissors },
  { to: '/templates', label: 'Templates', icon: FileText },
  { to: '/bulk-jobs/upload', label: 'Bulk Upload', icon: Upload },
  { to: '/logs', label: 'Notification Logs', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { user, logout, isStaff } = useAuth();
  const links = isStaff ? staffLinks : customerLinks;

  return (
    <aside className="w-64 min-h-screen bg-espresso flex flex-col shrink-0">
      <div className="px-6 py-8 border-b border-white/10">
        <h1 className="font-display text-2xl text-cream-100 tracking-wider">✦ Salon</h1>
        <p className="text-cream-200/50 text-xs mt-1 tracking-widest uppercase">{isStaff ? 'Staff Portal' : 'My Account'}</p>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
              isActive ? 'bg-gold/20 text-gold font-semibold' : 'text-cream-200/70 hover:bg-white/5 hover:text-cream-100',
            )}>
            <Icon size={16} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-cream-100 text-sm font-semibold truncate">{user?.name}</p>
        <p className="text-cream-200/50 text-xs truncate">{user?.email}</p>
        <button onClick={logout} className="mt-3 flex items-center gap-2 text-cream-200/60 hover:text-cream-100 text-xs transition-colors">
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );
}