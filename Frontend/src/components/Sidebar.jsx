import {
  LayoutDashboard,
  Wallet,
  Mic,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Wallet, label: "Expenses" },
  { icon: Mic, label: "Voice Assistant" },
  { icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="w-64 shrink-0 bg-gradient-to-b from-[#0f0f15] to-[#0a0a0f] border-r border-indigo-500/10 flex flex-col h-screen sticky top-0 px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-10 group">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:shadow-indigo-500/60 transition-all">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-base leading-tight text-white">Jervis</p>
          <p className="text-[10px] tracking-widest text-indigo-400/60 font-semibold">
            AI TRACKER
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
            }`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span>{label}</span>
            {active && (
              <div className="ml-auto w-2 h-2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />
            )}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-white/5 my-4" />

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/30"
      >
        <LogOut size={18} className="flex-shrink-0" />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default Sidebar;
