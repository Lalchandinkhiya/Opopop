import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  QrCode,
  Sparkles,
  ArrowRight,
  Clock,
  History,
} from 'lucide-react';
import { audio } from '../../services/audioService';
import { RazorpayUpiScanner } from './RazorpayUpiScanner';

interface AddMoneyViewProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const AddMoneyView: React.FC<AddMoneyViewProps> = ({ onBack, onSuccess }) => {
  const { user, wallet, refreshWallet, setActiveTab } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [stage, setStage] = useState<'SELECT' | 'RAZORPAY_SCANNER' | 'SUCCESS'>('SELECT');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txnDetails, setTxnDetails] = useState<{
    txnId: string;
    amount: number;
    method: string;
    date: string;
    newBalance: number;
    utr: string;
  } | null>(null);

  const presets = [55, 100, 250, 500, 1000, 2000, 5000];
  const currentAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;

  const handleSelectPreset = (amt: number) => {
    audio.playChip();
    setSelectedAmount(amt);
    setIsCustom(false);
    setError(null);
  };

  const handleProceedToScanner = () => {
    if (currentAmount < 55) {
      setError('Minimum deposit amount is ₹55.');
      return;
    }
    audio.playClick();
    setError(null);
    setStage('RAZORPAY_SCANNER');
  };

  const handlePaymentSuccess = async (details: {
    utr: string;
    amount: number;
    orderId: string;
    method: string;
  }) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updatedWallet = await api.addCredits(
        user.id,
        details.amount,
        details.method,
        details.utr
      );
      await refreshWallet();
      audio.playJackpot();
      setTxnDetails({
        txnId: `pay_${Date.now().toString(36)}_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: details.amount,
        method: 'Razorpay UPI QR',
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        newBalance: updatedWallet.availableGameCredits,
        utr: details.utr,
      });
      setStage('SUCCESS');
      if (onSuccess) onSuccess();
    } catch (e: any) {
      audio.playLoss();
      setError(e.message || 'Payment processing failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (stage === 'SUCCESS' && txnDetails) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-display font-black text-white">
            Deposit Successful!
          </h2>
          <p className="text-3xl font-extrabold font-mono text-emerald-400">
            ₹{txnDetails.amount.toFixed(2)}
          </p>
          <span className="text-xs text-[#9CA3AF]">
            Virtual Game Credits added to your wallet
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131622] border border-white/10 space-y-2.5 text-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[#9CA3AF]">Transaction ID</span>
            <span className="font-mono text-white font-bold">{txnDetails.txnId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#9CA3AF]">UTR / Ref Number</span>
            <span className="font-mono text-[#F5C542] font-bold">{txnDetails.utr}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#9CA3AF]">Payment Gateway</span>
            <span className="text-white font-bold">{txnDetails.method}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#9CA3AF]">Date & Time</span>
            <span className="text-white">{txnDetails.date}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[#9CA3AF]">New Available Balance</span>
            <span className="font-mono text-base font-black text-[#F5C542]">
              ₹{txnDetails.newBalance.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              audio.playClick();
              setActiveTab('HOME');
            }}
            className="w-full h-12 rounded-xl gold-gradient-btn text-sm font-bold flex items-center justify-center shadow-lg active:scale-95"
          >
            Back to Home & Play
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setActiveTab('WALLET');
            }}
            className="w-full h-11 rounded-xl bg-[#1A1F30] border border-white/10 hover:border-white/20 text-xs font-bold text-white transition-colors"
          >
            Go to Wallet
          </button>
        </div>
      </div>
    );
  }

  // SCREEN: RAZORPAY UPI SCANNER (WITH 3-MINUTE TIMER)
  if (stage === 'RAZORPAY_SCANNER') {
    return (
      <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-left space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              audio.playClick();
              setStage('SELECT');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141724] border border-white/5 text-xs text-white hover:bg-[#1A1F30] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Amount</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5C542]">
            <span>⚡ Razorpay UPI Gateway</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <RazorpayUpiScanner
          amount={currentAmount}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setStage('SELECT')}
        />
      </div>
    );
  }

  // SCREEN: SELECT AMOUNT
  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-left space-y-5">
      {/* Top Bar */}
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
        <span className="text-xs font-bold text-[#9CA3AF]">
          Balance: ₹{wallet?.availableGameCredits.toLocaleString() ?? '0'}
        </span>
      </div>

      {/* Hero Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            UPI SCANNER GATEWAY
          </span>
        </div>
        <h1 className="text-2xl font-display font-black text-white">DEPOSIT MONEY (पैसे जोड़ें)</h1>
        <p className="text-xs text-[#9CA3AF]">
          Deposit directly via Razorpay BHIM UPI Scanner with 3-minute verified gateway.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Preset Amount Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#D1D5DB] block">
          Choose Deposit Amount (राशि चुनें)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {presets.slice(0, 6).map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleSelectPreset(amt)}
              className={`h-12 rounded-xl text-sm font-bold font-mono transition-all border ${
                !isCustom && selectedAmount === amt
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/30 scale-[1.02]'
                  : 'bg-[#141724] text-white border-white/5 hover:border-white/20'
              }`}
            >
              ₹{amt.toLocaleString()}
            </button>
          ))}
        </div>

        {/* ₹5,000 High Roller Button */}
        <button
          type="button"
          onClick={() => handleSelectPreset(5000)}
          className={`w-full h-12 rounded-xl text-sm font-bold font-mono transition-all border flex items-center justify-center gap-2 ${
            !isCustom && selectedAmount === 5000
              ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/30'
              : 'bg-[#141724] text-white border-white/5 hover:border-white/20'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#F5C542]" />
          <span>₹5,000 (VIP High Roller)</span>
        </button>
      </div>

      {/* Custom Amount Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#D1D5DB] block">
          Or Enter Custom Amount (Min ₹55)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3 text-base font-bold text-[#F5C542]">₹</span>
          <input
            type="text"
            placeholder="Enter custom amount"
            value={customAmount}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setCustomAmount(val);
              setIsCustom(true);
            }}
            className={`w-full h-12 pl-9 pr-4 rounded-xl bg-[#141724] border text-sm font-mono font-bold text-white focus:outline-none ${
              isCustom ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]' : 'border-white/10'
            }`}
          />
        </div>
      </div>

      {/* Preview Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-[#131728] to-[#0E101A] border border-blue-500/30 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-blue-300 block">TOTAL TO PAY</span>
          <span className="text-2xl font-black font-mono text-white">
            ₹{currentAmount.toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#9CA3AF] block">SCANNER TIMER</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
            <Clock className="w-3.5 h-3.5" />
            <span>3:00 Minutes</span>
          </span>
        </div>
      </div>

      {/* Action CTA */}
      <button
        onClick={handleProceedToScanner}
        disabled={currentAmount < 55}
        className="w-full h-14 rounded-2xl gold-gradient-btn text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/25 disabled:opacity-40 cursor-pointer"
      >
        <span>OPEN UPI QR SCANNER (₹{currentAmount.toLocaleString()})</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Supported UPI Brand logos */}
      <div className="pt-2 text-center space-y-2">
        <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">
          Pay with Any UPI App
        </span>
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-[#141724] border border-white/5">PhonePe</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#141724] border border-white/5">Google Pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#141724] border border-white/5">Paytm</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#141724] border border-white/5">BHIM UPI</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#141724] border border-white/5">Cred</span>
        </div>
      </div>
    </div>
  );
};
