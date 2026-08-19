import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const HistoryPage = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/expenses/monthly-summary')
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const goToMonth = (year, month) => {
    // Calendar page reads year/month from its own state, so pass via query params
    navigate(`/calendar?year=${year}&month=${month - 1}`); // JS Date months are 0-indexed
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />
        <div className="orb w-96 h-96 bg-indigo-600 top-[-100px] left-[-100px] pointer-events-none" />
        <div className="orb w-96 h-96 bg-purple-600 bottom-[-100px] right-[-50px] pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
          <div className="mb-6 animate-slide-up">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              History
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your spending, month by month</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : summary.length === 0 ? (
            <div className="text-center py-16 bg-[#111118] border border-white/10 rounded-2xl">
              <CalendarIcon size={32} className="text-gray-600 mx-auto mb-2 opacity-50" />
              <p className="text-gray-500 text-sm">No expense history yet</p>
            </div>
          ) : (
            <div className="space-y-3 animate-slide-up">
              {summary.map((entry, i) => {
                const prev = summary[i + 1]; // next in array = previous chronologically (sorted newest-first)
                const changePct = prev ? ((entry.total - prev.total) / prev.total) * 100 : null;
                const isCurrentMonth =
                  entry.year === new Date().getFullYear() && entry.month === new Date().getMonth() + 1;

                return (
                  <button
                    key={`${entry.year}-${entry.month}`}
                    onClick={() => goToMonth(entry.year, entry.month)}
                    className="w-full flex items-center justify-between bg-[#111118] border border-white/10 hover:border-indigo-500/30 rounded-xl px-5 py-4 transition-all text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm sm:text-base">
                          {MONTH_NAMES[entry.month - 1]} {entry.year}
                        </p>
                        {isCurrentMonth && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {entry.count} transaction{entry.count !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {changePct !== null && (
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            changePct > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {changePct > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {Math.abs(changePct).toFixed(0)}%
                        </span>
                      )}
                      <p className="font-bold text-lg text-indigo-300">₹{entry.total.toLocaleString()}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;