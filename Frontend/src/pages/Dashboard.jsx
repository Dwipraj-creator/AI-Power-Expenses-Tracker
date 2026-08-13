import { useState, useEffect, useMemo } from "react";
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
} from "recharts";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Wallet,
  Tag,
  FileText,
  Mic,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import VoiceOrb from "../components/VoiceOrb";

const CATEGORIES = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
];
const CATEGORY_COLORS = {
  Food: "#818cf8",
  Shopping: "#a78bfa",
  Transport: "#38bdf8",
  Bills: "#fb7185",
  Entertainment: "#facc15",
  Health: "#34d399",
  Other: "#94a3b8",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    amount: "",
    category: "Food",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;

    setSubmitting(true);
    try {
      await api.post("/expenses", {
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
        inputMethod: "manual",
      });
      setForm({ amount: "", category: "Food", description: "" });
      fetchExpenses();
    } catch (err) {
      setError("Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
    } catch (err) {
      setError("Failed to delete expense");
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
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayTotal = expenses
        .filter(
          (exp) => new Date(exp.timestamp).toDateString() === d.toDateString(),
        )
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
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);
  const budgetPct =
    monthlyBudget > 0
      ? Math.min((thisMonthSpent / monthlyBudget) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar />

      <div className="flex-1 relative overflow-hidden">
        {/* Background layer */}
        <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />
        <div className="orb w-96 h-96 bg-indigo-600 top-[-100px] left-[-100px] pointer-events-none" />
        <div
          className="orb w-96 h-96 bg-purple-600 bottom-[-100px] right-[-50px] pointer-events-none"
          style={{ animationDelay: "3s" }}
        />

        <div className="relative z-10 p-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8 animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Welcome back,{" "}
                <span className="text-indigo-300">{user?.name}</span>
              </h1>
              <p className="text-gray-400 text-sm mt-2">
                Manage your expenses with AI assistance
              </p>
            </div>
            <span className="flex items-center gap-2 text-xs bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/40 px-4 py-2 rounded-full text-emerald-300 font-medium shadow-lg shadow-emerald-500/10">
              <ShieldCheck size={14} /> AI-Powered
            </span>
          </div>

          {error && (
            <p className="mb-6 text-red-300 text-sm bg-red-500/15 border border-red-500/40 rounded-lg px-4 py-3 backdrop-blur-sm animate-slide-up">
              {error}
            </p>
          )}

          <div className="grid lg:grid-cols-3 gap-6 animate-slide-up">
            {/* Center: AI orb + quick add + expense list */}
            <div className="lg:col-span-2 space-y-6">
              {/* Voice Assistant Card - Highlighted */}
              <div className="bg-gradient-to-br from-[#111118] to-[#0f0f15] border border-indigo-500/30 rounded-2xl p-10 flex flex-col items-center text-center shadow-2xl shadow-indigo-600/20 hover:border-indigo-500/50 transition-all duration-300">
                <div className="mb-6">
                  <VoiceOrb />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Voice-Powered Assistant
                </h2>
                <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                  Coming soon: Add expenses hands-free using your voice. For
                  now, use the form below to track your spending.
                </p>

                {/* Quick Add Form */}
                <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        name="amount"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#0a0a0f] border border-white/10 focus:border-indigo-500/50 rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">
                        Category
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full bg-[#0a0a0f] border border-white/10 focus:border-indigo-500/50 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer"
                      >
                        {CATEGORIES.map((cat) => (
                          <option
                            key={cat}
                            value={cat}
                            className="bg-[#111118]"
                          >
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="text-xs font-semibold text-gray-400 mb-2 block">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      name="description"
                      placeholder="What did you spend on?"
                      value={form.description}
                      onChange={handleChange}
                      className="w-full bg-[#0a0a0f] border border-white/10 focus:border-indigo-500/50 rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-600/50 disabled:to-purple-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-lg shadow-indigo-600/40 transition-all duration-200"
                    >
                      <Plus size={16} /> Add Expense
                    </button>
                    <button
                      type="button"
                      disabled
                      title="Voice input coming soon"
                      className="p-3 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-gray-400 transition-all"
                    >
                      <Mic size={18} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Expense list */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wallet size={18} className="text-indigo-400" />
                    Recent Expenses
                  </h2>
                  {!loading && expenses.length > 0 && (
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-medium">
                      {expenses.length} total
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        Loading expenses...
                      </p>
                    </div>
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-center">
                    <div>
                      <Wallet
                        size={32}
                        className="text-gray-600 mx-auto mb-2 opacity-50"
                      />
                      <p className="text-gray-500 text-sm">No expenses yet</p>
                      <p className="text-gray-600 text-xs mt-1">
                        Add your first expense using the form above
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {expenses.map((exp) => (
                      <div
                        key={exp._id}
                        className="flex items-center justify-between bg-gradient-to-r from-[#0a0a0f] to-[#0f0f15] border border-white/5 hover:border-indigo-500/30 rounded-lg px-4 py-3 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="flex-shrink-0 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full font-medium">
                            {exp.category}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {exp.description || "No description"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {new Date(exp.timestamp).toLocaleDateString()} at{" "}
                              {new Date(exp.timestamp).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                          <span className="font-semibold text-indigo-300 whitespace-nowrap">
                            ₹{exp.amount.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleDelete(exp._id)}
                            className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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

            {/* Right column: charts & stats */}
            <div className="space-y-6">
              {/* Spend trend */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-white/15 transition-all">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  📊 7-Day Spend Trend
                </h3>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={spendTrend}>
                    <XAxis
                      dataKey="day"
                      stroke="#6b7280"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111118",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 10,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                      labelStyle={{ color: "#fff" }}
                      cursorStyle={{ strokeDasharray: "5 5" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#a78bfa"
                      strokeWidth={2.5}
                      dot={{ fill: "#a78bfa", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category breakdown */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 hover:border-white/15 transition-all">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  🏷️ Top Categories
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={categoryBreakdown}>
                    <XAxis
                      dataKey="category"
                      stroke="#6b7280"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111118",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 10,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar
                      dataKey="amount"
                      radius={[8, 8, 0, 0]}
                      isAnimationActive={true}
                    >
                      {categoryBreakdown.map((entry, i) => (
                        <Bar
                          key={i}
                          dataKey="amount"
                          fill={CATEGORY_COLORS[entry.category] || "#818cf8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Budget gauge */}
              <div className="bg-gradient-to-br from-[#111118] to-[#0f0f15] border border-white/10 rounded-2xl p-6 hover:border-white/15 transition-all">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  💰 Monthly Budget
                </h3>
                {monthlyBudget > 0 ? (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-400">
                          Spent this month
                        </span>
                        <span className="text-sm font-bold text-white">
                          ₹{thisMonthSpent.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            budgetPct > 90
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : budgetPct > 70
                                ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          }`}
                          style={{ width: `${budgetPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>{budgetPct.toFixed(0)}% used</span>
                        <span>₹{monthlyBudget.toLocaleString()} goal</span>
                      </div>
                    </div>
                    {budgetPct > 90 && (
                      <div className="text-xs bg-red-500/15 border border-red-500/40 text-red-300 px-3 py-2 rounded-lg">
                        ⚠️ You've used {budgetPct.toFixed(0)}% of your budget
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400">
                      No monthly budget set
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Configure your budget in settings
                    </p>
                  </div>
                )}
              </div>

              {/* Total spent card */}
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 rounded-2xl p-6 hover:border-indigo-500/60 transition-all">
                <p className="text-xs text-indigo-300/70 font-semibold mb-2">
                  ALL-TIME TOTAL
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      ₹{total.toLocaleString()}
                    </p>
                    <p className="text-xs text-indigo-300/60 mt-1">
                      across {expenses.length} expense
                      {expenses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Wallet size={32} className="text-indigo-400/40" />
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
