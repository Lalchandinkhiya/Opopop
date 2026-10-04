import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LedgerEntry, CreditRequest } from '../../types';
import {
  Wallet as WalletIcon,
  PlusCircle,
  FileText,
  History,
  Building,
  CreditCard,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { audio } from '../../services/audioService';

export const WalletView: React.FC = () => {
  const {
    user,
    wallet,
    refreshWallet,
    setShowAddCreditsModal,
    setActiveTab,
  } = useAuth();

  const [activeHistoryTab, setActiveHistoryTab] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW' | 'BONUS'>('ALL');
  const [ledgerList, setLedgerList] = useState<LedgerEntry[]>([]);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number>(500);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      api.getLedger(user.id).then(setLedgerList);
    }
  }, [user, wallet]);

  const handleRefresh = async () => {
    audio.playClick();
    setIsRefreshing(true);
    await refreshWallet();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const hasDeposited = (wallet?.totalDepositsCount ?? 0) > 0;
  const quickPresets = [55, 100, 250, 500, 1000, 2000];

  const filteredLedgers = ledgerList.filter((l) => {
    if (activeHistoryTab === 'DEPOSIT') return l.type === 'DEPOSIT_CREDIT';
    if (activeHistoryTab === 'WITHDRAW') return l.type === 'ADMIN_ADJUSTMENT' && l.amount < 0;
    if (activeHistoryTab === 'BONUS') return l.type === 'SIGNUP_BONUS' || l.type === 'PROMOTIONAL_CREDIT';
    return true;
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 space-y-4 text-left">
      {/* Wallet Balance Card (Screen 11) */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-[#1C2034] via-[#121422] to-[#0A0C13] border border-[#D4AF37]/35 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5C542]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider">
              TOTAL BALANCE
            </span>
            <button
              onClick={handleRefresh}
              className="p-1 rounded-full hover:bg-white/10 text-[#9CA3AF] hover:text-[#F5C542] transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F5C542]' : ''}`} />
            </button>
          </div>

          {/* Big Balance Number */}
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            ₹{wallet?.availableGameCredits.toLocaleString() ?? '50'}.00
          </div>

          {/* Split Credits */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
            <div className="p-2.5 rounded-xl bg-[#141724]">
              <span className="text-[9px] uppercase tracking-wider text-[#9CA3AF] block font-semibold">
                Game Credits
              </span>
              <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                ₹{((wallet?.availableGameCredits ?? 50) - (wallet?.bonusCredits ?? 0) > 0 ? (wallet?.availableGameCredits ?? 50) - (wallet?.bonusCredits ?? 0) : 0).toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#141724]">
              <span className="text-[9px] uppercase tracking-wider text-[#9CA3AF] block font-semibold">
                Bonus Credits
              </span>
              <span className="text-sm font-bold font-mono text-[#F5C542] mt-0.5 block">
                ₹{wallet?.bonusCredits ?? 50}
              </span>
            </div>
          </div>

          {/* Primary Buttons: Add Money & Withdraw */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                audio.playChip();
                setShowAddCreditsModal(true);
              }}
              className="h-11 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#D4AF37]/20 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4 fill-current" />
              <span>Add Money</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('WITHDRAW' as any);
              }}
              className="h-11 rounded-xl bg-[#1D2236] hover:bg-[#252B44] border border-[#D4AF37]/30 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Quick Action Circles (Screen 11) */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            audio.playClick();
            setActiveTab('GAME_HISTORY' as any);
          }}
          className="p-3 rounded-2xl bg-[#131622] border border-white/5 hover:border-[#D4AF37]/40 flex flex-col items-center gap-1.5 transition-all active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1A1F30] flex items-center justify-center text-[#F5C542]">
            <History className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-white">History</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            setActiveTab('REQUESTS');
          }}
          className="p-3 rounded-2xl bg-[#131622] border border-white/5 hover:border-[#D4AF37]/40 flex flex-col items-center gap-1.5 transition-all active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1A1F30] flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-white">My Requests</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            setActiveTab('WITHDRAW' as any);
          }}
          className="p-3 rounded-2xl bg-[#131622] border border-white/5 hover:border-[#D4AF37]/40 flex flex-col items-center gap-1.5 transition-all active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1A1F30] flex items-center justify-center text-blue-400">
            <Building className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-white">Bank Details</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            setActiveTab('TXN_HISTORY' as any);
          }}
          className="p-3 rounded-2xl bg-[#131622] border border-white/5 hover:border-[#D4AF37]/40 flex flex-col items-center gap-1.5 transition-all active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1A1F30] flex items-center justify-center text-purple-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-white">Transactions</span>
        </button>
      </div>

      {/* First Deposit Lock Banner if 0 deposits */}
      {!hasDeposited && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block uppercase">
              First Deposit Required
            </span>
            <span className="text-[#D1D5DB] text-[11px] block mt-0.5">
              Make at least 1 deposit (Min ₹55) to unlock VIP Slots and instant bank withdrawals.
            </span>
          </div>
        </div>
      )}

      {/* Quick Add Money Section (Screen 11) */}
      <div className="p-4 rounded-2xl bg-[#131622] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">Quick Add Money</span>
          <span className="text-[10px] text-[#9CA3AF] font-mono">Min ₹55</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickPresets.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                audio.playChip();
                setSelectedQuickAmount(amt);
              }}
              className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                selectedQuickAmount === amt
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black'
                  : 'bg-[#1C2030] text-white border-white/5'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            audio.playChip();
            setShowAddCreditsModal(true);
          }}
          className="w-full h-11 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <span>Add ₹{selectedQuickAmount} Now</span>
        </button>
      </div>

      {/* Recent Ledger Records */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            RECENT TRANSACTIONS
          </span>
          <button
            onClick={() => setActiveTab('TXN_HISTORY' as any)}
            className="text-[11px] text-[#F5C542] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-white/5 rounded-2xl bg-[#131622] border border-white/5 overflow-hidden">
          {filteredLedgers.slice(0, 4).map((l) => {
            const isPositive = l.amount > 0;
            return (
              <div key={l.ledgerId} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-white block">{l.description || l.type}</span>
                    <span className="text-[10px] text-[#9CA3AF] font-mono">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span
                  className={`font-mono font-bold ${
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isPositive ? `+₹${l.amount.toLocaleString()}` : `-₹${Math.abs(l.amount).toLocaleString()}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
