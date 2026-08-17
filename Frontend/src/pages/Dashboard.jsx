import { useState, useEffect, useMemo } from "react";
import { speak, speakAck, stopSpeaking } from '../utils/speak';
import Toast from '../components/Toast';
import { requestNotificationPermission, sendBrowserNotification } from '../utils/notify';
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
  Cell,
  LabelList
} from "recharts";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Wallet,
  Tag,
  FileText,
  Mic,
  MicOff,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useWakeWord } from "../hooks/useWakeWord";
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
  const [lastCommand, setLastCommand] = useState("");
  const [parsedExpense, setParsedExpense] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [savingVoiceExpense, setSavingVoiceExpense] = useState(false);

  const [budgetStatus, setBudgetStatus] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);

  const [toast, setToast] = useState(null);
  const [lastAlertStatus, setLastAlertStatus] = useState(null);

  const { sessionActive, status, startSession, stopSession, isSupported, startConfirmationListening } = useWakeWord({
    onWake: () => {
      speakAck(user?.name);
    },
    onCommand: async (text) => {
      setLastCommand(text);
      setParsedExpense(null);
      setParseError("");
      setParsing(true);

      try {
        const res = await api.post("/ai/parse-expense", { rawText: text });
        setParsedExpense(res.data);

        const desc = res.data.description ? ` for ${res.data.description}` : "";
        speak(`You spent ₹${res.data.amount} on ${res.data.category}${desc}. Say save to confirm, or cancel to redo.`);

        startConfirmationListening();
      } catch (err) {
        const msg = err.response?.data?.message || "Could not understand that as an expense.";
        setParseError(msg);
        speak(msg);
      } finally {
        setParsing(false);
      }
    },
    onConfirm: () => {
      handleSaveVoiceExpense();
    },
  });

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

  const fetchBudgetStatus = async () => {
    try {
      const res = await api.get('/budget/status');
      setBudgetStatus(res.data);
    } catch (err) {
      console.error('Failed to load budget status');
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchBudgetStatus();
  }, []);

  // Watch budgetStatus and fire a toast + browser notification when it CHANGES to warning/danger
  useEffect(() => {
    if (!budgetStatus || !budgetStatus.status) return;

    const isAlertLevel = budgetStatus.status === 'warning' || budgetStatus.status === 'danger';
    const statusChanged = budgetStatus.status !== lastAlertStatus;

    if (isAlertLevel && statusChanged) {
      const message =
        budgetStatus.status === 'danger'
          ? `At this pace, you'll spend ~₹${budgetStatus.projectedTotal?.toLocaleString()} — over your ₹${budgetStatus.monthlyBudget?.toLocaleString()} budget.`
          : `You're spending faster than planned — projected ₹${budgetStatus.projectedTotal?.toLocaleString()} by month end.`;

      setToast({ level: budgetStatus.status, message });
      sendBrowserNotification(
        budgetStatus.status === 'danger' ? 'Budget Alert' : 'Budget Warning',
        message
      );
    }

    setLastAlertStatus(budgetStatus.status);
  }, [budgetStatus, lastAlertStatus]);

  const handleSaveVoiceExpense = async () => {
    if (!parsedExpense) return;
    setSavingVoiceExpense(true);
    try {
      await api.post('/expenses', {
        amount: parsedExpense.amount,
        category: parsedExpense.category,
        description: parsedExpense.description,
        timestamp: parsedExpense.date,
        inputMethod: 'voice',
        rawText: parsedExpense.rawText,
      });
      fetchExpenses();
      fetchBudgetStatus();
      speak(`Saved! ₹${parsedExpense.amount} for ${parsedExpense.category}.`);
      setParsedExpense(null);
      setLastCommand('');
    } catch (err) {
      setParseError('Failed to save expense');
      speak('Sorry, something went wrong saving that.');
    } finally {
      setSavingVoiceExpense(false);
    }
  };

  const handleCancelVoiceExpense = () => {
    stopSpeaking();
    setParsedExpense(null);
    setLastCommand('');
    setParseError('');
  };

  const handleSaveBudget = async () => {
    const value = Number(budgetInput);
    if (!value || value <= 0) return;

    setSavingBudget(true);
    try {
      await api.put('/users/budget', { monthlyBudget: value });
      setEditingBudget(false);
      setBudgetInput('');
      fetchBudgetStatus();
    } catch (err) {
      console.error('Failed to update budget');
    } finally {
      setSavingBudget(false);
    }
  };

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
      fetchBudgetStatus();
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
      fetchBudgetStatus();
    } catch (err) {
      setError("Failed to delete expense");
    }
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // --- Derived chart data from real expenses ---

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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col md:flex-row">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <Sidebar />

      <div className="flex-1 relative overflow-hidden">
        {/* Background layer */}
        <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />
        <div className="orb w-48 h-48 md:w-96 md:h-96 bg-indigo-600 top-[-50px] md:top-[-100px] left-[-50px] md:left-[-100px] pointer-events-none" />
        <div
          className="orb w-48 h-48 md:w-96 md:h-96 bg-purple-600 bottom-[-50px] md:bottom-[-100px] right-[-50px] md:right-[-50px] pointer-events-none"
          style={{ animationDelay: "3s" }}
        />

        <div className="relative z-10 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 animate-slide-up">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Welcome, <span className="text-indigo-300">{user?.name}</span>
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                Manage your expenses with AI
              </p>
            </div>
            <span className="flex items-center gap-2 text-xs bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-emerald-300 font-medium shadow-lg shadow-emerald-500/10 whitespace-nowrap">
              <ShieldCheck size={12} /> AI-Powered
            </span>
          </div>

          {error && (
            <p className="mb-6 text-red-300 text-sm bg-red-500/15 border border-red-500/40 rounded-lg px-4 py-3 backdrop-blur-sm animate-slide-up">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up">
            {/* Center: AI orb + quick add + expense list */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Voice Assistant Card - Highlighted */}
              <div className="bg-gradient-to-br from-[#111118] to-[#0f0f15] border border-indigo-500/30 rounded-2xl p-6 sm:p-10 flex flex-col items-center text-center shadow-2xl shadow-indigo-600/20 hover:border-indigo-500/50 transition-all duration-300">

                <div className="mb-4 sm:mb-6 scale-75 sm:scale-100 origin-top">
                  <VoiceOrb
                    status={status}
                    onClick={() => {
                      if (!isSupported) return;
                      if (sessionActive) {
                        stopSpeaking();
                        stopSession();
                      } else {
                        startSession();
                      }
                    }}
                  />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                  Voice Assistant
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm max-w-lg leading-relaxed">
                  {!isSupported
                    ? "Voice recognition is not supported in this browser. Try Chrome."
                    : status === "idle"
                    ? 'Tap the orb to start — then say "Jarvis" to give a command.'
                    : status === "waiting-for-wake"
                    ? 'Listening for "Jarvis"... (tap to stop)'
                    : status === "confirming"
                    ? 'Say "save" to confirm, or "cancel" to redo...'
                    : "Listening to your command..."}
                </p>

                {lastCommand && (
                  <p className="mt-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1.5">
                    Heard: "{lastCommand}"
                  </p>
                )}

                {parsing && (
                  <p className="mt-3 text-xs text-gray-400 flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    Understanding that...
                  </p>
                )}

                {parseError && (
                  <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {parseError}
                  </p>
                )}

                {parsedExpense && (
                  <div className="mt-4 w-full bg-[#0a0a0f] border border-indigo-500/30 rounded-xl p-4 text-left">
                    <p className="text-xs text-gray-400 mb-2">Does this look right?</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Amount:</span> <span className="font-semibold">₹{parsedExpense.amount}</span></p>
                      <p><span className="text-gray-500">Category:</span> {parsedExpense.category}</p>
                      <p><span className="text-gray-500">Description:</span> {parsedExpense.description || "—"}</p>
                      <p><span className="text-gray-500">Date:</span> {new Date(parsedExpense.date).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={handleSaveVoiceExpense}
                        disabled={savingVoiceExpense}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition"
                      >
                        {savingVoiceExpense ? 'Saving...' : 'Save Expense'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelVoiceExpense}
                        disabled={savingVoiceExpense}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-gray-400 hover:bg-white/5 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Add Form */}
                <form
                  onSubmit={handleSubmit}
                  className="w-full mt-6 sm:mt-8 space-y-3 sm:space-y-4"
                >
                  <div className="grid grid-cols-1 gap-3">
                    <div className="relative">
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 sm:mb-2 block">
                        Amount
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
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 sm:mb-2 block">
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
                  <div className="flex gap-2 sm:gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-600/50 disabled:to-purple-600/50 disabled:cursor-not-allowed text-white font-semibold py-2 sm:py-3 rounded-lg text-sm sm:text-base shadow-lg shadow-indigo-600/40 transition-all duration-200"
                    >
                      <Plus size={14} />{" "}
                      <span className="hidden sm:inline">Add</span> Expense
                    </button>
                  </div>
                </form>
              </div>

              {/* Expense list */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Wallet size={16} className="text-indigo-400" />
                    Recent Expenses
                  </h2>
                  {!loading && expenses.length > 0 && (
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 sm:px-3 py-1 rounded-full font-medium">
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
                  <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto pr-2">
                    {expenses.map((exp) => (
                      <div
                        key={exp._id}
                        className="flex items-center justify-between bg-gradient-to-r from-[#0a0a0f] to-[#0f0f15] border border-white/5 hover:border-indigo-500/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 transition-all duration-200 group text-sm sm:text-base"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="flex-shrink-0 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 sm:px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                            {exp.category}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-white truncate">
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
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
                          <span className="font-semibold text-indigo-300 whitespace-nowrap text-xs sm:text-base">
                            ₹{exp.amount.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleDelete(exp._id)}
                            className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-1 sm:p-1.5 rounded-lg transition-all opacity-0 sm:opacity-0 group-hover:opacity-100 hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column: charts & stats */}
            <div className="space-y-4 sm:space-y-6">
              {/* Spend trend */}
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-white/15 transition-all">
                <h3 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  📊 7-Day Spend Trend
                </h3>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={spendTrend}>
                    <XAxis
                      dataKey="day"
                      stroke="#6b7280"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111118",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 10,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                      labelStyle={{ color: "#fff" }}
                      cursor={{ strokeDasharray: "5 5" }}
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
              <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-white/15 transition-all">
                <h3 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  🏷️ Top Categories
                </h3>
                <ResponsiveContainer width="100%" height={120}>
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
                        <Cell
                          key={i}
                          fill={CATEGORY_COLORS[entry.category] || "#818cf8"}
                        />
                      ))}
                      <LabelList
                        dataKey="amount"
                        position="top"
                        fill="#ffffff"
                        fontSize={11}
                        fontWeight={600}
                        formatter={(value) => `₹${value}`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Budget gauge */}
              <div className="bg-gradient-to-br from-[#111118] to-[#0f0f15] border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    💰 Budget
                  </h3>
                  {budgetStatus?.monthlyBudget > 0 && !editingBudget && (
                    <button
                      onClick={() => {
                        setBudgetInput(String(budgetStatus.monthlyBudget));
                        setEditingBudget(true);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editingBudget ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      placeholder="Enter monthly budget"
                      className="w-full bg-[#0a0a0f] border border-white/10 focus:border-indigo-500/50 rounded-lg px-3 py-2 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveBudget}
                        disabled={savingBudget}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition"
                      >
                        {savingBudget ? 'Saving...' : 'Save Budget'}
                      </button>
                      <button
                        onClick={() => setEditingBudget(false)}
                        className="px-3 py-2 rounded-lg text-xs border border-white/10 text-gray-400 hover:bg-white/5 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : !budgetStatus?.monthlyBudget ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400">No monthly budget set</p>
                    <button
                      onClick={() => setEditingBudget(true)}
                      className="mt-3 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-4 py-2 rounded-lg transition"
                    >
                      Set Budget
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 sm:mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-400">Spent this month</span>
                        <span className="text-xs sm:text-sm font-bold text-white">
                          ₹{budgetStatus.spentSoFar?.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            budgetStatus.status === 'danger'
                              ? 'bg-gradient-to-r from-red-500 to-red-600'
                              : budgetStatus.status === 'warning'
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                          }`}
                          style={{ width: `${Math.min(budgetStatus.budgetUsedPct, 100)}%` }}
                        />
                        <div
                          className="absolute top-0 h-full w-0.5 bg-white/60"
                          style={{ left: `${Math.min(budgetStatus.monthProgressPct, 100)}%` }}
                          title="Ideal pace"
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>{budgetStatus.budgetUsedPct}% used</span>
                        <span>₹{budgetStatus.monthlyBudget.toLocaleString()} goal</span>
                      </div>
                    </div>

                    {budgetStatus.status === 'danger' && (
                      <div className="text-xs bg-red-500/15 border border-red-500/40 text-red-300 px-3 py-2 rounded-lg">
                        🚨 At this pace, you'll spend ~₹{budgetStatus.projectedTotal?.toLocaleString()} this month — over your ₹{budgetStatus.monthlyBudget.toLocaleString()} budget.
                      </div>
                    )}
                    {budgetStatus.status === 'warning' && (
                      <div className="text-xs bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 px-3 py-2 rounded-lg">
                        ⚠️ You're spending faster than planned — projected ₹{budgetStatus.projectedTotal?.toLocaleString()} by month end.
                      </div>
                    )}
                    {budgetStatus.status === 'on-track' && (
                      <div className="text-xs bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-lg">
                        ✅ You're on track — {budgetStatus.daysRemaining} days left this month.
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Total spent card */}
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 rounded-2xl p-4 sm:p-6 hover:border-indigo-500/60 transition-all">
                <p className="text-xs text-indigo-300/70 font-semibold mb-2">
                  TOTAL
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      ₹{total.toLocaleString()}
                    </p>
                    <p className="text-xs text-indigo-300/60 mt-1">
                      {expenses.length} transaction
                      {expenses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Wallet size={24} className="text-indigo-400/40" />
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