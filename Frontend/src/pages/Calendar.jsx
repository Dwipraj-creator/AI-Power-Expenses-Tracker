import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Hash, Wallet } from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' | 'detailed'
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchMonthExpenses = async () => {
    setLoading(true);
    try {
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const res = await api.get(`/expenses?startDate=${startDate}&endDate=${endDate}`);
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to load expenses for calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthExpenses();
    setSelectedDay(null);
  }, [year, month]);

  // Group expenses by day-of-month number
  const expensesByDay = useMemo(() => {
    const map = {};
    expenses.forEach((exp) => {
      const d = new Date(exp.timestamp).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(exp);
    });
    return map;
  }, [expenses]);

  const dayTotals = useMemo(() => {
    const totals = {};
    Object.entries(expensesByDay).forEach(([day, list]) => {
      totals[day] = list.reduce((sum, e) => sum + e.amount, 0);
    });
    return totals;
  }, [expensesByDay]);

  const maxDayTotal = Math.max(1, ...Object.values(dayTotals));

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const heatIntensity = (day) => {
    const total = dayTotals[day];
    if (!total) return 'bg-white/[0.02]';
    const ratio = total / maxDayTotal;
    if (ratio > 0.75) return 'bg-indigo-500/70';
    if (ratio > 0.5) return 'bg-indigo-500/45';
    if (ratio > 0.25) return 'bg-indigo-500/25';
    return 'bg-indigo-500/10';
  };

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />
        <div className="orb w-96 h-96 bg-indigo-600 top-[-100px] left-[-100px] pointer-events-none" />
        <div className="orb w-96 h-96 bg-purple-600 bottom-[-100px] right-[-50px] pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-slide-up">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Calendar
              </h1>
              <p className="text-gray-400 text-sm mt-1">See your spending day by day</p>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-[#111118] border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'heatmap' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={13} /> Heatmap
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'detailed' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Hash size={13} /> Amounts
              </button>
            </div>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4 animate-slide-up">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-sm sm:text-base font-semibold">{monthLabel}</h2>
              {!isCurrentMonth && (
                <button
                  onClick={goToToday}
                  className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-full"
                >
                  Today
                </button>
              )}
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 sm:p-6 animate-slide-up">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {cells.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;

                  const isToday = isCurrentMonth && day === today.getDate();
                  const total = dayTotals[day];
                  const hasExpenses = !!total;
                  const isSelected = selectedDay === day;

                  return (
                    <button
                      key={day}
                      onClick={() => hasExpenses && setSelectedDay(isSelected ? null : day)}
                      disabled={!hasExpenses}
                      className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all ${
                        isSelected
                          ? 'border-indigo-400 ring-1 ring-indigo-400'
                          : isToday
                          ? 'border-indigo-500/50'
                          : 'border-white/5'
                      } ${viewMode === 'heatmap' ? heatIntensity(day) : hasExpenses ? 'bg-white/[0.03]' : 'bg-white/[0.01]'} ${
                        hasExpenses ? 'cursor-pointer hover:border-indigo-400/50' : 'cursor-default'
                      }`}
                    >
                      <span className={`text-xs sm:text-sm ${isToday ? 'text-indigo-300 font-bold' : 'text-gray-300'}`}>
                        {day}
                      </span>
                      {viewMode === 'detailed' && hasExpenses && (
                        <span className="text-[9px] sm:text-[10px] text-indigo-300 font-medium leading-none">
                          ₹{total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected day details */}
          {selectedDay && expensesByDay[selectedDay] && (
            <div className="mt-5 bg-[#111118] border border-indigo-500/30 rounded-2xl p-5 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Wallet size={15} className="text-indigo-400" />
                  {monthLabel.split(' ')[0]} {selectedDay} — ₹{dayTotals[selectedDay].toLocaleString()}
                </h3>
                <button onClick={() => setSelectedDay(null)} className="text-xs text-gray-500 hover:text-white">
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {expensesByDay[selectedDay].map((exp) => (
                  <div
                    key={exp._id}
                    className="flex items-center justify-between bg-[#0a0a0f] border border-white/5 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                        {exp.category}
                      </span>
                      <span className="text-sm text-gray-300">{exp.description || 'No description'}</span>
                    </div>
                    <span className="text-sm font-semibold text-indigo-300">₹{exp.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;