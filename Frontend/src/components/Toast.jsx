import { useEffect } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => onDismiss(), 6000); // auto-dismiss after 6s
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isDanger = toast.level === 'danger';

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-up">
      <div
        className={`flex items-start gap-3 max-w-sm rounded-xl border p-4 shadow-2xl backdrop-blur-md ${
          isDanger
            ? 'bg-red-500/10 border-red-500/40 shadow-red-900/30'
            : 'bg-yellow-500/10 border-yellow-500/40 shadow-yellow-900/30'
        }`}
      >
        {isDanger ? (
          <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-semibold ${isDanger ? 'text-red-300' : 'text-yellow-300'}`}>
            {isDanger ? 'Budget Alert' : 'Budget Warning'}
          </p>
          <p className="text-xs text-gray-300 mt-1">{toast.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-white text-xs shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;