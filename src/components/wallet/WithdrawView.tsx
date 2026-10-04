import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BankAccount } from '../../types';
import {
  ArrowLeft,
  Building,
  CreditCard,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface WithdrawViewProps {
  onBack?: () => void;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet, setActiveTab, setShowAddCreditsModal } = useAuth();
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [showAddBank, setShowAddBank] = useState<boolean>(false);
  const [newBankName, setNewBankName] = useState<string>('HDFC Bank');
  const [newAccNumber, setNewAccNumber] = useState<string>('');
  const [newIfsc, setNewIfsc] = useState<string>('');
  const [newHolder, setNewHolder] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const hasDeposited = (wallet?.totalDepositsCount ?? 0) > 0;
  const currentAmount = isCustom ? Number(customAmount) || 0 : amount;

  useEffect(() => {
    if (user) {
      api.getBankAccounts(user.id).then((banks) => {
        setBankAccounts(banks);
        if (banks.length > 0) setSelectedBankId(banks[0].id);
      });
    }
  }, [user]);

  const handleSelectPreset = (val: number) => {
    audio.playChip();
    setAmount(val);
    setIsCustom(false);
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAccNumber.trim()) return;
    try {
      const added = await api.addBankAccount(user.id, {
        bankName: newBankName,
        accountNumberMasked: `•••• •••• ${newAccNumber.slice(-4)}`,
        ifscCode: newIfsc.toUpperCase() || 'HDFC0001234',
        holderName: newHolder.trim() || user.fullName,
        isDefault: true,
      });
      setBankAccounts((prev) => [...prev, added]);
      setSelectedBankId(added.id);
      setShowAddBank(false);
      audio.playWin();
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!hasDeposited) {
      audio.playLoss();
      setFeedback({
        type: 'error',
        message: 'First deposit required: You must make at least 1 deposit before requesting a withdrawal.',
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
        note: `Bank withdrawal to ${selectedBankId}`,
      });
      await refreshWallet();
      audio.playJackpot();
      setFeedback({
        type: 'success',
        message: `Withdrawal request of ₹${currentAmount} submitted successfully! Our finance team is reviewing your payout.`,
      });
    } catch (err: any) {
      audio.playLoss();
      setFeedback({ type: 'error', message: err.message || 'Request submission failed.' });
    } finally {
      setIsLoading(false);
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
            else setActiveTab('WALLET');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141724] border border-white/5 text-xs text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
          WITHDRAW MONEY
        </span>
      </div>

      {/* Available Balance Box */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#171B2A] to-[#11131C] border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block">
            AVAILABLE BALANCE
          </span>
          <span className="text-2xl font-black font-mono text-white mt-0.5 block">
            ₹{wallet?.availableGameCredits.toLocaleString() ?? '0'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block">
            STATUS
          </span>
          <span
            className={`text-xs font-bold font-mono ${
              hasDeposited ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {hasDeposited ? 'Withdrawals Active' : 'Deposit Needed'}
          </span>
        </div>
      </div>

      {/* Mandatory Deposit Alert */}
      {!hasDeposited && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              First Deposit Required
            </h4>
            <p className="text-xs text-[#D1D5DB] mt-0.5 leading-relaxed">
              Without an initial deposit, withdrawal requests remain locked. Make your first deposit (Min ₹55) to unlock instant withdrawals.
            </p>
            <button
              onClick={() => setShowAddCreditsModal(true)}
              className="mt-2 text-xs font-semibold text-[#F5C542] hover:underline flex items-center gap-1"
            >
              <span>Deposit Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Enter Amount Section */}
      <div className="p-4 rounded-2xl bg-[#131622] border border-white/10 space-y-3">
        <label className="text-xs font-bold text-white block">
          Enter Amount (Min ₹55)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-3 text-base font-bold text-[#F5C542]">₹</span>
          <input
            type="number"
            value={isCustom ? customAmount : amount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setIsCustom(true);
            }}
            placeholder="500"
            className="w-full h-12 pl-8 pr-4 rounded-xl bg-[#0D0F18] border border-white/10 text-white font-mono text-base font-bold focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Preset Pills */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[100, 500, 1000, 2000].map((val) => (
            <button
              key={val}
              onClick={() => handleSelectPreset(val)}
              className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                !isCustom && amount === val
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-[#1C2030] text-white border-white/5'
              }`}
            >
              ₹{val}
            </button>
          ))}
        </div>
      </div>

      {/* Select Bank Account */}
      <div className="p-4 rounded-2xl bg-[#131622] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white">
            Select Bank Account
          </label>
          <button
            onClick={() => setShowAddBank(!showAddBank)}
            className="text-xs text-[#F5C542] font-semibold hover:underline flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Account</span>
          </button>
        </div>

        {/* Existing bank select */}
        <div className="space-y-2">
          {bankAccounts.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBankId(b.id)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selectedBankId === b.id
                  ? 'bg-amber-500/10 border-amber-500/50'
                  : 'bg-[#0E101A] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs">
                  🏦
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {b.bankName}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-mono">
                    {b.accountNumberMasked} · {b.ifscCode}
                  </span>
                </div>
              </div>
              {selectedBankId === b.id && (
                <div className="w-4 h-4 rounded-full bg-[#D4AF37] flex items-center justify-center text-black text-[10px] font-bold">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Bank Form Modal/Accordion */}
        {showAddBank && (
          <form onSubmit={handleAddBank} className="pt-2 space-y-2 border-t border-white/10">
            <div>
              <span className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Bank Name</span>
              <input
                type="text"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                placeholder="HDFC Bank"
                className="w-full h-9 px-3 rounded-lg bg-[#0C0E16] border border-white/10 text-xs text-white"
                required
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Account Number</span>
              <input
                type="text"
                value={newAccNumber}
                onChange={(e) => setNewAccNumber(e.target.value)}
                placeholder="1234567890"
                className="w-full h-9 px-3 rounded-lg bg-[#0C0E16] border border-white/10 text-xs text-white font-mono"
                required
              />
            </div>
            <div>
              <span className="text-[10px] text-[#9CA3AF] uppercase block mb-1">IFSC Code</span>
              <input
                type="text"
                value={newIfsc}
                onChange={(e) => setNewIfsc(e.target.value)}
                placeholder="HDFC0001234"
                className="w-full h-9 px-3 rounded-lg bg-[#0C0E16] border border-white/10 text-xs text-white uppercase font-mono"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[#1F2436] hover:bg-[#272D44] text-xs font-bold text-white transition-colors"
            >
              Save Bank Account
            </button>
          </form>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !hasDeposited}
        className="w-full h-12 rounded-xl gold-gradient-btn text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
      >
        <span>{isLoading ? 'Processing...' : 'Submit Request'}</span>
      </button>

      {/* Footer Disclaimer */}
      <p className="text-center text-[10px] text-[#9CA3AF] flex items-center justify-center gap-1">
        <span>🔒</span>
        <span>Your request will be reviewed by admin within 15-30 minutes.</span>
      </p>
    </div>
  );
};
