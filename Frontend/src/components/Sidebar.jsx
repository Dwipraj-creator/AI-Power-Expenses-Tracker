import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Mic,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  Calendar
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Settings, label: "Settings", path: "/settings" },
   { icon: Calendar, label: "Calendar", path: "/calendar" },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = (
    <>
      <div className="flex items-center gap-3 px-3 mb-8 md:mb-10 group">
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

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => {
                navigate(path);
                setIsOpen(false);
              }}
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
          );
        })}
      </nav>

      <div className="h-px bg-white/5 my-4" />

      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/30"
      >
        <LogOut size={18} className="flex-shrink-0" />
        <span>Log Out</span>
      </button>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="md:hidden fixed top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#111118]/90 text-white shadow-lg shadow-indigo-500/10 backdrop-blur-sm transition-transform duration-200 hover:scale-105"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 ease-out"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-72 flex-col border-r border-indigo-500/10 bg-gradient-to-b from-[#0f0f15] to-[#0a0a0f] px-4 py-6 shadow-2xl shadow-black/50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
          "md:static md:flex md:w-64 md:translate-x-0 md:opacity-100 md:shrink-0 md:h-screen md:sticky md:top-0 md:shadow-none",
        ].join(" ")}
      >
        {navigation}
      </aside>
    </>
  );
};

export default Sidebar;