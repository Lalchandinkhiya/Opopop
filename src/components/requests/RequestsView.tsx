import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CreditRequest } from '../../types';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  History,
  ArrowUpRight,
  XCircle,
} from 'lucide-react';
import { audio } from '../../services/audioService';

const PRESET_AMOUNTS = [55, 100, 250, 500, 1000, 2000, 5000];

export const RequestsView: React.FC = () => {
  const { user, wallet, refreshWallet, setShowAddCreditsModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'REQUEST' | 'HISTORY'>('REQUEST');
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(55);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const hasDeposited = (wallet?.totalDepositsCount ?? 0) > 0;
  const currentAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;
  const isValidAmount = currentAmount >= 55;

  const loadRequests = async () => {
    if (user) {
      const list = await api.getWithdrawHistory(user.id);
      setRequests(list);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleSelectPreset = (amt: number) => {
    audio.playChip();
    setSelectedAmount(amt);
    setIsCustom(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    setIsCustom(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!hasDeposited) {
      audio.playLoss();
      setFeedback({
        type: 'error',
        message:
          'First deposit required: You must make at least one credit deposit before submitting withdrawal or settlement requests.',
      });
      return;
    }

    if (currentAmount < 55) {
      audio.playLoss();
      setFeedback({ type: 'error', message: 'Minimum withdrawal amount is ₹55.' });
      return;
    }

    if ((wallet?.availableGameCredits ?? 0) < currentAmount) {
      audio.playLoss();
      setFeedback({
        type: 'error',
        message: `Insufficient balance. You have ₹${wallet?.availableGameCredits} available.`,
      });
      return;
    }

    setFeedback(null);
    setIsLoading(true);
    try {
      await api.submitRequest({
        userId: user.id,
        amount: currentAmount,
        requestType: 'WITHDRAWAL_REDEMPTION',
        note,
      });
      await refreshWallet();
      await loadRequests();
      audio.playWin();
      setFeedback({
        type: 'success',
        message: `Your withdrawal request for ₹${currentAmount} has been submitted for administrator review.`,
      });
      setNote('');
    } catch (err: any) {
      audio.playLoss();
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit withdrawal request.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: CreditRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            PENDING (प्रक्रिया में)
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            APPROVED (स्वीकृत)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PAID OUT (सफलतापूर्वक भेजा गया)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            REJECTED (अस्वीकृत - रिफंडेड)
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-3 pb-24 space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          WITHDRAW MONEY (पैसे निकालें / विथड्रॉ)
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          Minimum withdrawal: <strong className="text-[#F5C542]">₹55</strong> · 100% Secure Settlement
        </p>
      </div>

      {/* Sub Tabs: Withdraw / Withdraw History */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('REQUEST')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'REQUEST'
              ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20'
              : 'bg-[#141724] text-[#9CA3AF]'
          }`}
        >
          Request Withdrawal (पैसे निकालें)
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'HISTORY'
              ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20'
              : 'bg-[#141724] text-[#9CA3AF]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Withdraw History ({requests.length})</span>
        </button>
      </div>

      {/* Critical First Deposit Rule Banner */}
      {!hasDeposited ? (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#1C1520] to-[#12141F] border border-red-500/30 space-y-3">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Withdrawals Locked: First Deposit Required
              </h4>
              <p className="text-xs text-[#D1D5DB] mt-1 leading-relaxed">
                As per organisation policy, a verified initial deposit is strictly mandatory before any member can submit withdrawal requests.
              </p>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => {
                audio.playChip();
                setShowAddCreditsModal(true);
              }}
              className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-[#D4AF37]/20 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4 fill-current" />
              <span>Make First Deposit (Min ₹55 Demo)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Verified Deposit Active ({wallet?.totalDepositsCount} deposits). Withdrawals are fully unlocked.
          </span>
        </div>
      )}

      {activeTab === 'REQUEST' ? (
        /* Request Form */
        <div className="p-6 rounded-3xl bg-[#131622] border border-[#D4AF37]/25 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Enter Withdrawal Amount
            </h3>
            <span className="text-xs font-mono font-bold text-[#F5C542]">
              Available: ₹{wallet?.availableGameCredits.toLocaleString() ?? 0}
            </span>
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preset Buttons Grid */}
            <div>
              <label className="text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider block mb-2">
                Select Amount (निकासी राशि)
              </label>

              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.slice(0, 6).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`h-11 rounded-xl text-sm font-bold font-mono transition-all border ${
                      !isCustom && selectedAmount === amt
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md shadow-[#D4AF37]/30 scale-[1.02]'
                        : 'bg-[#181B2A] text-white border-white/5 hover:border-white/20'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleSelectPreset(5000)}
                className={`w-full h-11 mt-2 rounded-xl text-sm font-bold font-mono transition-all border ${
                  !isCustom && selectedAmount === 5000
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md shadow-[#D4AF37]/30'
                    : 'bg-[#181B2A] text-white border-white/5 hover:border-white/20'
                }`}
              >
                ₹5,000 (Maximum Slot)
              </button>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1">
                Or Custom Amount (Min ₹55)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#F5C542]">
                  ₹
                </span>
                <input
                  type="text"
                  placeholder="Enter custom withdrawal amount"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="w-full h-11 px-3.5 pl-8 rounded-xl bg-[#171B28] border border-white/10 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* UPI ID / Bank Remarks */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1">
                Payout Details / Note (UPI or Bank Account)
              </label>
              <input
                type="text"
                placeholder="e.g. UPI: name@okhdfcbank or Bank Account No"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#171B28] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!hasDeposited || !isValidAmount || isLoading}
              className="w-full h-12 rounded-xl gold-gradient-btn text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-[#D4AF37]/20"
            >
              {isLoading ? (
                <span>Submitting to Ledger...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>SUBMIT WITHDRAWAL (₹{currentAmount.toLocaleString()})</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Dedicated Withdraw History Tab */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Withdrawal History (विथड्रॉ हिस्ट्री)
            </h3>
            <span className="text-xs text-[#9CA3AF] font-mono">{requests.length} requests</span>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#12141F] border border-white/5 text-xs text-[#9CA3AF]">
              No withdrawal history found yet.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.requestId}
                  className="p-4 rounded-2xl bg-[#12141F] border border-white/5 space-y-2 hover:bg-white/[0.01]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-mono font-black text-white">
                          -₹{req.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF] font-mono block">
                          ID: {req.requestId}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-[#9CA3AF] gap-1 pt-1 border-t border-white/5">
                    <span>Date: {new Date(req.createdAt).toLocaleString()}</span>
                    {req.note && <span>Details: {req.note}</span>}
                  </div>

                  {req.adminNote && (
                    <div className="p-2 rounded-lg bg-[#181B2A] text-xs text-amber-200">
                      <strong>Admin Status Note:</strong> {req.adminNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
