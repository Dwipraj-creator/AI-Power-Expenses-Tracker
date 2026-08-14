import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f15] to-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="orb w-96 h-96 bg-indigo-600 top-[-100px] left-[-100px]" />
      <div
        className="orb w-96 h-96 bg-purple-600 bottom-[-100px] right-[-50px]"
        style={{ animationDelay: "3s" }}
      />

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <Sparkles size={16} sm:size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold leading-tight text-base sm:text-lg">
                Jervis
              </p>
              <p className="text-[8px] sm:text-[9px] tracking-widest text-indigo-300/60 font-semibold">
                AI-POWERED TRACKING
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <span className="hidden sm:flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/40 px-3 py-1.5 rounded-full text-emerald-300 font-medium">
              <ShieldCheck size={13} /> Secure
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md">
            {/* Badge */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold tracking-widest bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                🔐 SECURE AUTH
              </span>
            </div>

            {/* Main card */}
            <div className="bg-gradient-to-br from-[#111118] to-[#0f0f15] border border-indigo-500/20 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-indigo-600/20 backdrop-blur-sm animate-slide-up">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
                Welcome back
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Sign in to manage your expenses with AI-powered insights.
              </p>

              {error && (
                <div className="text-red-300 text-xs sm:text-sm mt-5 sm:mt-6 bg-red-500/15 border border-red-500/40 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 animate-slide-up">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-6 sm:mt-8 space-y-4 sm:space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wide text-gray-400 block">
                    EMAIL
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/15 focus:border-indigo-500/50 rounded-lg pl-11 pr-4 py-2.5 sm:py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold tracking-wide text-gray-400">
                      PASSWORD
                    </label>
                    <span className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/15 focus:border-indigo-500/50 rounded-lg pl-11 pr-4 py-2.5 sm:py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base shadow-lg shadow-indigo-600/40 transition-all duration-200 mt-6 sm:mt-8"
                >
                  Sign in <ArrowRight size={14} sm:size={16} />
                </button>
              </form>

              <div className="flex items-center gap-3 my-5 sm:my-7">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs text-gray-500 font-medium">OR</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <a
                href="http://localhost:5000/api/auth/google"
                className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-300 hover:text-white py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              >
                🔐 Continue with Google
              </a>

              <p className="mt-8 text-sm text-center text-gray-400">
                No account yet?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Footer text */}
            <p className="text-center text-xs text-gray-600 mt-8">
              Protected by industry-standard encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
