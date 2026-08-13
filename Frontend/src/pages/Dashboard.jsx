import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ShieldCheck, Plus, Trash2, Wallet, Tag, FileText, Mic } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import VoiceOrb from '../components/VoiceOrb';

const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Health', 'Other'];
const CATEGORY_COLORS = {
  Food: '#818cf8',
  Shopping: '#a78bfa',
  Transport: '#38bdf8',
  Bills: '#fb7185',
  Entertainment: '#facc15',
  Health: '#34d399',
  Other: '#94a3b8',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;

    setSubmitting(true);
    try {
      await api.post('/expenses', {
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
        inputMethod: 'manual',
      });
      setForm({ amount: '', category: 'Food', description: '' });
      fetchExpenses();
    } catch (err) {
      setError('Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // --- Derived chart data from real expenses ---

  // Last 7 days spend trend
  const spendTrend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayTotal = expenses
        .filter((exp) => new Date(exp.timestamp).toDateString() === d.toDateString())
        .reduce((sum, exp) => sum + exp.amount, 0);
      days.push({ day: label, amount: dayTotal });
    }
    return days;
  }, [expenses]);

  // Category breakdown (top 5)
  const categoryBreakdown = useMemo(() => {
    const totals = {};
    expenses.forEach((exp) => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  // Budget gauge
  const monthlyBudget = user?.monthlyBudget || 0;
  const thisMonthSpent = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((exp) => {
        const d = new Date(exp.timestamp);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);
  const budgetPct = monthlyBudget > 0 ? Math.min((thisMonthSpent / monthlyBudget) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar />

      <div className="flex-1 relative overflow-hidden">
        {/* Background layer */}
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="orb w-96 h-96 bg-indigo-600 top-[-100px] left-[-100px] pointer-events-none" />
        <div
          className="orb w-96 h-96 bg-purple-600 bottom-[-100px] right-[-50px] pointer-events-none"
          style={{ animationDelay: '3s' }}
        />

        <div className="relative z-10 p-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold">
                Welcome, <span className="text-indigo-400">{user?.name}!</span>
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">Here's your expense overview</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-emerald-400">
              <ShieldCheck size={12} /> AI-Powered
            </span>
          </div>

          {error && (
            <p className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Center: AI orb + quick add + expense list */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
                <VoiceOrb />
                <p className="text-gray-400 text-sm mt-4 max-w-sm">
                  Voice assistant coming soon — for now, add expenses manually below.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="w-full mt-6 flex flex-wrap gap-2 items-center bg-[#0a0a0f] border border-white/10 rounded-full px-3 py-2"
                >
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    className="flex-1 min-w-[90px] bg-transparent px-2 py-1.5 text-sm placeholder-gray-600 focus:outline-none"
                  />
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="bg-transparent text-sm text-gray-300 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#111118]">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    className="flex-1 min-w-[100px] bg-transparent px-2 py-1.5 text-sm placeholder-gray-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition text-sm font-medium px-4 py-2 rounded-full disabled:opacity-50"
                  >
                    <Plus size={14} /> Add
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Voice input coming in a later step"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 text-gray-500 cursor-not-allowed"
                  >
                    <Mic size={15} />
                  </button>
                </form>
              </div>

              {/* Expense list */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-300 mb-4">Recent Expenses</h2>

                {loading ? (
                  <p className="text-gray-500 text-sm">Loading...</p>
                ) : expenses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No expenses yet — add your first one above.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {expenses.map((exp) => (
                      <div
                        key={exp._id}
                        className="flex items-center justify-between bg-[#0a0a0f] border border-white/5 rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded-full">
                            {exp.category}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{exp.description || 'No description'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(exp.timestamp).toLocaleString()} · {exp.inputMethod}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">₹{exp.amount.toLocaleString()}</span>
                          <button
                            onClick={() => handleDelete(exp._id)}
                            className="text-gray-500 hover:text-red-400 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column: charts */}
            <div className="space-y-5">
              {/* Spend trend */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-gray-400 mb-2">Spend Trend (7 days)</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={spendTrend}>
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#818cf8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category breakdown */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-gray-400 mb-2">Top Categories</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={categoryBreakdown}>
                    <XAxis dataKey="category" stroke="#6b7280" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {categoryBreakdown.map((entry, i) => (
                        <Bar key={i} fill={CATEGORY_COLORS[entry.category] || '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Budget gauge */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-gray-400 mb-3">Monthly Budget</p>
                {monthlyBudget > 0 ? (
                  <>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${budgetPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>₹{thisMonthSpent.toLocaleString()} spent</span>
                      <span>₹{monthlyBudget.toLocaleString()} goal</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">No monthly budget set yet.</p>
                )}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Wallet size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Spent (all time)</p>
                    <p className="text-lg font-bold">₹{total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;