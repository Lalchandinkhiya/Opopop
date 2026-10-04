import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  UserCircle,
  Building,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Bell,
  CheckSquare,
  Users,
  HelpCircle,
  Info,
  LogOut,
  Crown,
  ChevronRight,
  Settings,
  Trash2,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { audio } from '../../services/audioService';

export const ProfileView: React.FC = () => {
  const { user, wallet, logout, setActiveTab, refreshWallet } = useAuth();
  const [kycStatus] = useState<'Pending' | 'Verified'>('Pending');
  const [activeModal, setActiveModal] = useState<{
    title: string;
    description: string;
    details?: { label: string; value: string }[];
  } | null>(null);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  const handleClearCache = async () => {
    audio.playClick();
    setIsClearing(true);
    try {
      const result = await api.clearJunkAndCache();
      await refreshWallet();
      audio.playJackpot();
      setToastMessage(
        `Cache & Junk cleared! Freed ${result.freedKb} KB. App optimized.`
      );
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e: any) {
      setToastMessage(e.message || 'Failed to clear cache.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsClearing(false);
    }
  };

  const menuItems = [
    {
      id: 'MY_PROFILE',
      label: 'My Profile (प्रोफ़ाइल विवरण)',
      icon: UserCircle,
      iconColor: 'text-[#F5C542]',
      action: () => {
        setActiveModal({
          title: 'Member Profile Details',
          description: 'Your registered private membership details.',
          details: [
            { label: 'Full Name', value: user.fullName },
            { label: 'Member ID', value: user.memberId },
            { label: 'Mobile Number', value: user.mobileNumber },
            { label: 'Account Role', value: user.role },
            { label: 'Primary Device ID', value: user.primaryDeviceId },
          ],
        });
      },
    },
    {
      id: 'BANK_DETAILS',
      label: 'Bank & UPI Details (बैंक विवरण)',
      icon: Building,
      iconColor: 'text-blue-400',
      action: () => setActiveTab('WITHDRAW' as any),
    },
    {
      id: 'KYC_VERIFICATION',
      label: 'KYC Verification',
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      badge: kycStatus,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      action: () => {
        setActiveModal({
          title: 'KYC Verification Status',
          description: 'Level 1 Device & Mobile Verification is Active.',
          details: [
            { label: 'Verification Level', value: 'Level 1 (Device Bound)' },
            { label: 'Mobile Auth', value: 'Verified' },
            { label: 'Document Status', value: 'Basic Active' },
          ],
        });
      },
    },
    {
      id: 'CLEAR_CACHE',
      label: 'Clear Junk & Cache (कैश और जंक साफ़ करें)',
      icon: Trash2,
      iconColor: 'text-emerald-400',
      badge: 'Optimize',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      action: handleClearCache,
    },
    {
      id: 'SECURITY',
      label: 'Security & Settings',
      icon: Settings,
      iconColor: 'text-purple-400',
      action: () => setActiveTab('SETTINGS' as any),
    },
    {
      id: 'MY_DEVICES',
      label: 'My Bound Device (हार्डवेयर सुरक्षा)',
      icon: Smartphone,
      iconColor: 'text-teal-400',
      badge: '1 Device Bound',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      action: () => {
        setActiveModal({
          title: 'Device Association & Security',
          description: 'Your account is cryptographically bound to this device for your privacy.',
          details: [
            { label: 'Device Identifier', value: user.primaryDeviceId },
            { label: 'Hardware Lock', value: 'Enabled' },
            { label: 'Binding Status', value: 'Active' },
          ],
        });
      },
    },
    {
      id: 'TASKS',
      label: 'Tasks & Bounties',
      icon: CheckSquare,
      iconColor: 'text-yellow-400',
      action: () => setActiveTab('TASKS' as any),
    },
    {
      id: 'REFERRALS',
      label: 'Refer & Earn',
      icon: Users,
      iconColor: 'text-sky-400',
      action: () => setActiveTab('REFER' as any),
    },
    {
      id: 'HELP',
      label: 'Help & Support',
      icon: HelpCircle,
      iconColor: 'text-emerald-400',
      action: () => setActiveTab('HELP' as any),
    },
    {
      id: 'ABOUT',
      label: 'About RECOVERY LOSSS',
      icon: Info,
      iconColor: 'text-[#9CA3AF]',
      badge: 'v1.0.0',
      badgeColor: 'bg-white/10 text-white border-white/20',
      action: () => {
        setActiveModal({
          title: 'About RECOVERY LOSSS',
          description: 'Private Membership Gaming Platform with live Razorpay UPI Scanner & Real Math Engines.',
          details: [
            { label: 'Platform Version', value: 'v1.0.0 PRO' },
            { label: 'Payment Gateway', value: 'Razorpay BHIM UPI' },
            { label: 'Database Engine', value: 'Firebase Firestore Persistent' },
            { label: 'Organisation Limit', value: '500 Members' },
          ],
        });
      },
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-left space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Overview Card (Screen 22) */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-[#1C2034] via-[#121422] to-[#0A0C13] border border-[#D4AF37]/35 shadow-2xl overflow-hidden flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#997A15] via-[#F5C542] to-[#FFE885] p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#121420] flex items-center justify-center text-2xl font-black text-[#F5C542] font-mono">
                {user.fullName.slice(0, 1).toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#121420] flex items-center justify-center text-[10px] text-black font-bold">
              ✓
            </div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base font-display font-black text-white leading-tight">
              {user.fullName}
            </h2>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#9CA3AF]">
                ID: {user.memberId}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-[9px] font-black text-amber-300 flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 text-[#F5C542]" />
                <span>VIP 1</span>
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block">
              Wallet: ₹{wallet?.availableGameCredits.toLocaleString() ?? '0'}
            </span>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              audio.playClick();
              setActiveTab('ADMIN');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[#F5C542] text-[10px] font-bold flex items-center gap-1 shadow-md active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        )}
      </div>

      {/* Menu List */}
      <div className="rounded-2xl bg-[#131622] border border-white/5 divide-y divide-white/5 overflow-hidden shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => {
                audio.playClick();
                item.action();
              }}
              className="p-3.5 flex items-center justify-between hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1A1F30] border border-white/5 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <span className="text-xs font-bold text-white">{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border font-mono ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              </div>
            </div>
          );
        })}

        {/* Logout */}
        <div
          onClick={() => {
            audio.playClick();
            logout();
          }}
          className="p-3.5 flex items-center justify-between hover:bg-red-500/10 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 text-red-400">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">Logout (लॉग आउट)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400" />
        </div>
      </div>

      {/* Detail In-App Modal Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#111422] border border-[#D4AF37]/30 p-5 space-y-4 text-left shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white">{activeModal.title}</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{activeModal.description}</p>
            </div>

            {activeModal.details && (
              <div className="p-3 rounded-2xl bg-[#090C16] border border-white/5 space-y-2 text-xs">
                {activeModal.details.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-[#9CA3AF]">{d.label}</span>
                    <span className="font-mono font-bold text-white max-w-[170px] truncate text-right">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold text-black"
            >
              Done (बंद करें)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
