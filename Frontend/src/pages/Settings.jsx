import { useState, useEffect } from 'react';
import { User, Lock, Wallet, Save, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Settings = () => {
  const { user, login } = useAuth();

  // Profile section
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Budget section
  const [budget, setBudget] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const [budgetMsg, setBudgetMsg] = useState('');

  // Password section
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => {
    api.get('/budget/status').then((res) => {
      if (res.data.monthlyBudget) setBudget(String(res.data.monthlyBudget));
    }).catch(() => {});
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await api.put('/auth/profile', { name });
      login(localStorage.getItem('token'), res.data); // refresh cached user
      setProfileMsg('Profile updated!');
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(''), 3000);
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const value = Number(budget);
    if (!value || value <= 0) return;
    setSavingBudget(true);
    setBudgetMsg('');
    try {
      await api.put('/users/budget', { monthlyBudget: value });
      setBudgetMsg('Budget updated!');
    } catch (err) {
      setBudgetMsg('Failed to update budget');
    } finally {
      setSavingBudget(false);
      setTimeout(() => setBudgetMsg(''), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErr('');
    setPasswordMsg('');
    setSavingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordErr(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
      setTimeout(() => { setPasswordMsg(''); setPasswordErr(''); }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />
        <div className="orb w-96 h-96 bg-indigo-600 top-[-100px] left-[-100px] pointer-events-none" />
        <div className="orb w-96 h-96 bg-purple-600 bottom-[-100px] right-[-50px] pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage your account and preferences</p>
          </div>

          <div className="space-y-5 animate-slide-up">
            {/* Profile */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <User size={16} className="text-indigo-400" /> Profile
              </h2>
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 focus:border-indigo-500/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <Save size={14} /> {savingProfile ? 'Saving...' : 'Save'}
                  </button>
                  {profileMsg && <span className="text-xs text-emerald-400">{profileMsg}</span>}
                </div>
              </form>
            </div>

            {/* Budget */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Wallet size={16} className="text-indigo-400" /> Monthly Budget
              </h2>
              <form onSubmit={handleSaveBudget} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Amount (₹)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-[#0a0a0f] border border-white/10 focus:border-indigo-500/50 rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={savingBudget}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <Save size={14} /> {savingBudget ? 'Saving...' : 'Save'}
                  </button>
                  {budgetMsg && <span className="text-xs text-emerald-400">{budgetMsg}</span>}
                </div>
              </form>
            </div>

            {/* Password */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Lock size={16} className="text-indigo-400" /> Change Password
              </h2>
              {user?.email && !currentPassword && (
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Leave blank if you signed up with Google
                </p>
              )}
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 focus:border-indigo-500/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 focus:border-indigo-500/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>
                {passwordErr && <p className="text-xs text-red-400">{passwordErr}</p>}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <Save size={14} /> {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                  {passwordMsg && <span className="text-xs text-emerald-400">{passwordMsg}</span>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;