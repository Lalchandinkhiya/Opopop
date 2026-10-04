import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { Bell, Volume2, VolumeX, ShieldAlert, PlusCircle, UserCircle, LogOut, RefreshCw, Crown } from 'lucide-react';
import { audio } from '../../services/audioService';

interface TopHeaderProps {
  onOpenNotifications?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenNotifications }) => {
  const {
    user,
    wallet,
    activeTab,
    setActiveTab,
    setShowAddCreditsModal,
    refreshWallet,
    isMuted,
    toggleMute,
    logout,
    notifications,
  } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    audio.playClick();
    setIsRefreshing(true);
    await refreshWallet();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0C13]/95 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-lg">
      <div className="max-w-5xl mx-auto px-3.5 h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Single element Brand Zone */}
        <button
          onClick={() => {
            audio.playClick();
            setActiveTab('HOME');
          }}
          className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          aria-label="Recovery Losss Home"
        >
          <BrandLogo size="md" />
        </button>

        {/* Zone 2: Tiranga Style Rupee Balance & VIP */}
        {user ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-[10px] font-bold text-amber-300">
              <Crown className="w-3 h-3 text-[#F5C542]" />
              <span>VIP 1</span>
            </div>

            <button
              onClick={() => {
                audio.playChip();
                setShowAddCreditsModal(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#151824] border border-[#D4AF37]/35 hover:border-[#D4AF37] transition-all shadow-sm focus:outline-none"
              title="Deposit ₹"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#997A15] to-[#F5C542] flex items-center justify-center text-[11px] font-black text-black shadow-inner">
                ₹
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-[#9CA3AF] font-medium leading-none">
                  Wallet
                </span>
                <span className="text-xs sm:text-sm font-black text-[#F3F4F6] font-mono tabular-nums leading-tight">
                  ₹{wallet?.availableGameCredits.toLocaleString() ?? '50'}
                </span>
              </div>

              <div
                onClick={handleRefresh}
                className="p-1 rounded-full hover:bg-white/10 text-[#9CA3AF] hover:text-[#F5C542] ml-0.5 transition-colors"
                title="Refresh Balance"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#F5C542]' : ''}`} />
              </div>

              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-[9px] font-bold text-amber-300 hidden sm:inline">
                + DEPOSIT
              </span>
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#9CA3AF]">
            <span>Member Gaming Platform</span>
          </div>
        )}

        {/* Zone 3: Context Actions */}
        <div className="flex items-center gap-1.5">
          {/* Audio toggle */}
          <button
            onClick={() => {
              toggleMute();
              audio.playClick();
            }}
            className="w-9 h-9 rounded-lg bg-[#141724] border border-white/5 flex items-center justify-center text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            aria-label="Sound Toggle"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#F5C542]" />}
          </button>

          {user && (
            <>
              {/* Notifications */}
              <button
                onClick={() => {
                  audio.playClick();
                  if (onOpenNotifications) onOpenNotifications();
                }}
                className="relative w-9 h-9 rounded-lg bg-[#141724] border border-white/5 flex items-center justify-center text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
                title="Organisation Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F5C542] ring-2 ring-[#0A0C13]" />
                )}
              </button>

              {/* Admin Button (if user has ADMIN/SUPER_ADMIN role) */}
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <button
                  onClick={() => {
                    audio.playClick();
                    setActiveTab('ADMIN');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'ADMIN'
                      ? 'bg-[#D4AF37] text-black shadow-md'
                      : 'bg-[#1C2032] border border-[#D4AF37]/30 text-[#F5C542] hover:bg-[#252B44]'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}

              {/* Profile Avatar Trigger */}
              <div className="relative">
                <button
                  onClick={() => {
                    audio.playClick();
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  className="w-9 h-9 rounded-lg bg-[#1B1F30] border border-[#D4AF37]/30 flex items-center justify-center text-[#F5C542] hover:border-[#D4AF37] transition-colors"
                  aria-label="User Profile"
                >
                  <span className="font-bold text-xs uppercase font-mono">
                    {user.fullName.slice(0, 2)}
                  </span>
                </button>

                {/* Profile quick dropdown */}
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141724] border border-[#D4AF37]/25 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-white/5">
                        <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                        <p className="text-xs text-[#F5C542] font-mono tracking-wider">{user.memberId}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            audio.playClick();
                            setActiveTab('PROFILE');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#D1D5DB] hover:bg-[#1E2338] flex items-center gap-2"
                        >
                          <UserCircle className="w-4 h-4 text-[#F5C542]" />
                          Profile & Device Safety
                        </button>
                        <button
                          onClick={() => {
                            audio.playClick();
                            setActiveTab('REQUESTS');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#D1D5DB] hover:bg-[#1E2338] flex items-center gap-2"
                        >
                          <span>◈</span>
                          Submit Requests (Min ₹55)
                        </button>
                      </div>

                      <div className="pt-1 border-t border-white/5">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out Session
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
