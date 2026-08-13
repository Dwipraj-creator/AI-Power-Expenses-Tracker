import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 bg-grid" />
      <div className="orb w-96 h-96 bg-indigo-600 top-[-100px] left-[-100px]" />
      <div
        className="orb w-96 h-96 bg-purple-600 bottom-[-100px] right-[-50px]"
        style={{ animationDelay: '3s' }}
      />

      {/* Foreground content */}
      <div className="relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="font-bold leading-none">Jervis</p>
              <p className="text-[10px] tracking-widest text-indigo-300/70 font-medium">
                EXPENSE TRACKER
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-emerald-400">
              <ShieldCheck size={12} /> AI-Powered
            </span>
            <span className="text-xs text-gray-400 hover:text-white cursor-pointer">
              Need help?
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-[#111118] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full">
              ● SECURE WORKSPACE ACCESS
            </span>

            <h1 className="text-3xl font-bold mt-5">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1">
              Sign in to your AI-powered expense tracker.
            </p>

            {error && (
              <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="text-xs font-medium tracking-wide text-gray-400">
                  EMAIL ADDRESS
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium tracking-wide text-gray-400">
                    PASSWORD
                  </label>
                  <span className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative mt-1.5">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-900/40"
              >
                Sign in <ArrowRight size={16} />
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            
              <a href="http://localhost:5000/api/auth/google"
              className="w-full flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 transition py-2.5 rounded-xl text-sm font-medium"
            >
              Continue with Google
            </a>

            <p className="mt-6 text-sm text-center text-gray-400">
              No account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;