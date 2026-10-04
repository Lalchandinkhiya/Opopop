import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LedgerEntry } from '../../types';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  History,
  ArrowDownLeft,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { audio } from '../../services/audioService';
import { RazorpayUpiScanner } from './RazorpayUpiScanner';

interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
}

const PRESET_AMOUNTS = [55, 100, 250, 500, 1000, 2000, 5000];

export const AddCreditsModal: React.FC<AddCreditsModalProps> = ({
  isOpen,
  onClose,
  initialAmount = 100,
}) => {
  const { user, refreshWallet } = useAuth();
  const [modalTab, setModalTab] = useState<'DEPOSIT' | 'HISTORY'>('DEPOSIT');
  const [step, setStep] = useState<'SELECT_AMOUNT' | 'SCANNER'>('SELECT_AMOUNT');
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [depositHistory, setDepositHistory] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      api.getDepositHistory(user.id).then((items) => setDepositHistory(items));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const currentAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;
  const isValidAmount = currentAmount >= 55;

  const handleSelectPreset = (amt: number) => {
    audio.playChip();
    setSelectedAmount(amt);
    setIsCustom(false);
    setError(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    setIsCustom(true);
    if (val && Number(val) < 55) {
      setError('Minimum deposit amount is ₹55.');
    } else {
      setError(null);
    }
  };

  const handleProceedToScanner = () => {
    if (!isValidAmount) {
      setError('Minimum deposit amount is ₹55.');
      return;
    }
    audio.playClick();
    setError(null);
    setStep('SCANNER');
  };

  const handlePaymentSuccess = async (details: {
    utr: string;
    amount: number;
    orderId: string;
    method: string;
  }) => {
    if (!user) return;
    try {
      await api.addCredits(user.id, details.amount, details.method, details.utr);
      await refreshWallet();
      const updatedHistory = await api.getDepositHistory(user.id);
      setDepositHistory(updatedHistory);
      audio.playJackpot();
      setSuccessMessage(
        `Payment of ₹${details.amount} Verified! Credits added to your wallet (UTR: ${details.utr}). All games & withdrawals are now active!`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        setStep('SELECT_AMOUNT');
        onClose();
      }, 2500);
    } catch (err: any) {
      audio.playLoss();
      setError(err.message || 'Deposit confirmation failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-md my-6 rounded-3xl bg-[#0D101A] border border-[#D4AF37]/35 shadow-2xl p-5 sm:p-6 text-left overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-8">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              100% VERIFIED RAZORPAY UPI GATEWAY
            </span>
          </div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span>DEPOSIT MONEY (पैसे जमा करें)</span>
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Minimum amount: <strong className="text-[#F5C542]">₹55</strong> · Real-Time QR Scanner
          </p>
        </div>

        {/* Navigation Sub-Tabs: DEPOSIT / HISTORY */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => {
              audio.playClick();
              setModalTab('DEPOSIT');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              modalTab === 'DEPOSIT'
                ? 'bg-[#D4AF37] text-black shadow-sm'
                : 'bg-[#151928] text-[#9CA3AF]'
            }`}
          >
            Add Deposit (जमा करें)
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setModalTab('HISTORY');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              modalTab === 'HISTORY'
                ? 'bg-[#D4AF37] text-black shadow-sm'
                : 'bg-[#151928] text-[#9CA3AF]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Deposit History ({depositHistory.length})</span>
          </button>
        </div>

        {modalTab === 'HISTORY' ? (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Previous Deposit Records
            </h4>
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5 rounded-2xl bg-[#080A10] border border-white/5">
              {depositHistory.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <QrCode className="w-8 h-8 text-[#9CA3AF] mx-auto opacity-40" />
                  <p className="text-xs text-[#9CA3AF]">No deposit history found yet.</p>
                  <p className="text-[11px] text-[#D4AF37]">
                    Make your first deposit to unlock withdrawals & slot games!
                  </p>
                </div>
              ) : (
                depositHistory.map((d) => (
                  <div key={d.ledgerId} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">+₹{d.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-[#9CA3AF] font-mono">
                          {new Date(d.createdAt).toLocaleDateString()} · {new Date(d.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                      SUCCESS
                    </span>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => {
                audio.playClick();
                setModalTab('DEPOSIT');
              }}
              className="w-full py-2.5 rounded-xl bg-[#1C2030] text-xs font-bold text-[#F5C542] hover:bg-[#242A40]"
            >
              Back to Deposit
            </button>
          </div>
        ) : (
          <div>
            {/* Success Banner */}
            {successMessage && (
              <div className="p-4 my-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-start gap-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div className="text-xs leading-relaxed font-semibold">{successMessage}</div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3 my-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: SELECT AMOUNT */}
            {step === 'SELECT_AMOUNT' && !successMessage && (
              <div className="space-y-4">
                {/* Presets Grid */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider mb-2">
                    Select Deposit Amount (राशि चुनें)
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
                            : 'bg-[#151928] text-white border-white/5 hover:border-white/20'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* High Roller ₹5,000 preset */}
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(5000)}
                    className={`w-full h-11 mt-2 rounded-xl text-sm font-bold font-mono transition-all border flex items-center justify-center gap-2 ${
                      !isCustom && selectedAmount === 5000
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md shadow-[#D4AF37]/30'
                        : 'bg-[#151928] text-white border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#F5C542]" />
                    <span>₹5,000 (VIP High Roller)</span>
                  </button>
                </div>

                {/* Custom Amount Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1">
                    Or Enter Custom Amount (Min ₹55)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#F5C542]">
                      ₹
                    </span>
                    <input
                      type="text"
                      placeholder="Enter amount (min 55)"
                      value={customAmount}
                      onChange={handleCustomChange}
                      className={`w-full h-11 px-3.5 pl-8 rounded-xl bg-[#171B28] border text-sm font-mono font-bold text-white focus:outline-none ${
                        isCustom ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]' : 'border-white/10'
                      }`}
                    />
                  </div>
                </div>

                {/* Information Banner */}
                <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-200">
                  <QrCode className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Clicking continue will open the <strong>Razorpay BHIM UPI Scanner</strong> with a live 3-minute payment countdown.
                  </p>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToScanner}
                  disabled={!isValidAmount}
                  className="w-full h-12 rounded-xl gold-gradient-btn text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-[#D4AF37]/20"
                >
                  <span>PROCEED TO UPI QR SCANNER (₹{currentAmount.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: RAZORPAY UPI SCANNER (WITH 3-MINUTE TIMER & USER SCREENSHOT CARD) */}
            {step === 'SCANNER' && !successMessage && (
              <div className="space-y-3">
                {/* Back to Change Amount button */}
                <div className="flex items-center justify-between pb-1">
                  <button
                    onClick={() => {
                      audio.playClick();
                      setStep('SELECT_AMOUNT');
                    }}
                    className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Amount</span>
                  </button>
                  <span className="text-xs font-mono font-bold text-[#F5C542]">
                    Deposit Amount: ₹{currentAmount.toFixed(2)}
                  </span>
                </div>

                {/* The Razorpay UPI Scanner with 3-minute timer */}
                <RazorpayUpiScanner
                  amount={currentAmount}
                  onPaymentSuccess={handlePaymentSuccess}
                  onCancel={() => setStep('SELECT_AMOUNT')}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
