import { LayoutDashboard, Wallet, Mic, Settings, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Wallet, label: 'Expenses' },
  { icon: Mic, label: 'Voice Assistant' },
  { icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="w-56 shrink-0 bg-[#111118] border-r border-white/10 flex flex-col h-screen sticky top-0 px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Sparkles size={16} />
        </div>
        <span className="font-bold">Jervis</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
              active
                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-red-400 transition"
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
};

export default Sidebar;