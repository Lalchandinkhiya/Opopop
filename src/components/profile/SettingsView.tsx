import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  User,
  Key,
  Globe,
  Bell,
  Eye,
  Moon,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface SettingsViewProps {
  onBack?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const { user, logout, setActiveTab } = useAuth();
  const [cacheCleared, setCacheCleared] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClearCache = () => {
    audio.playClick();
    setCacheCleared(true);
    setFeedback('Cache memory (24.5 MB) cleared successfully.');
    setTimeout(() => {
      setFeedback(null);
      setCacheCleared(false);
    }, 2500);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to permanently delete your RECOVERY LOSSS account? This action cannot be undone.')) {
      logout();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-left space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            audio.playClick();
            if (onBack) onBack();
            else setActiveTab('PROFILE');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141724] border border-white/5 text-xs text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
          SETTINGS
        </span>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Settings List */}
      <div className="rounded-2xl bg-[#131622] border border-white/5 divide-y divide-white/5 overflow-hidden">
        <div
          onClick={() => {
            audio.playClick();
            setFeedback('Account details verified.');
            setTimeout(() => setFeedback(null), 2000);
          }}
          className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-[#F5C542]" />
            <span className="text-xs font-bold text-white">Account Settings</span>
          </div>
          <span className="text-xs text-[#9CA3AF]">›</span>
        </div>

        <div
          onClick={() => {
            audio.playClick();
            setFeedback('Password management active.');
            setTimeout(() => setFeedback(null), 2000);
          }}
          className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Key className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white">Change Password</span>
          </div>
          <span className="text-xs text-[#9CA3AF]">›</span>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white">Language</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#F5C542]">English</span>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">Notification Settings</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">Enabled</span>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-bold text-white">Privacy Settings</span>
          </div>
          <span className="text-xs text-[#9CA3AF]">Protected</span>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-[#F5C542]" />
            <span className="text-xs font-bold text-white">Theme</span>
          </div>
          <span className="text-xs font-bold text-[#D4AF37]">Dark Luxury</span>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Security & 2FA</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">Hardware Locked</span>
        </div>

        <div
          onClick={handleClearCache}
          className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">Clear Cache</span>
          </div>
          <span className="text-xs font-mono text-[#9CA3AF]">
            {cacheCleared ? '0.0 MB' : '(24.5 MB)'}
          </span>
        </div>

        <div
          onClick={handleDeleteAccount}
          className="p-3.5 flex items-center justify-between hover:bg-red-500/10 cursor-pointer"
        >
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold">Delete Account</span>
          </div>
          <span className="text-xs text-red-400">›</span>
        </div>
      </div>
    </div>
  );
};
