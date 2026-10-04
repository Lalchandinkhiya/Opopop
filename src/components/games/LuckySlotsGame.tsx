import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, Sparkles, AlertCircle, Crown, Trophy, Zap, Play } from 'lucide-react';
import { audio } from '../../services/audioService';

interface LuckySlotsGameProps {
  onBack: () => void;
}

const SYMBOLS = ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'];

export const LuckySlotsGame: React.FC<LuckySlotsGameProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [stake, setStake] = useState<number>(50);
  const [reels, setReels] = useState<string[]>(['7️⃣', '7️⃣', '7️⃣']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [winModal, setWinModal] = useState<{
    betAmount: number;
    winAmount: number;
    newBalance: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stakes = [10, 50, 100, 500];

  const handleSpin = async () => {
    if (!user || isSpinning) return;
    if ((wallet?.availableGameCredits ?? 0) < stake) {
      setError('Insufficient balance in wallet.');
      audio.playLoss();
      return;
    }

    setError(null);
    setWinModal(null);
    setIsSpinning(true);
    audio.playChip();

    const spinDuration = isTurbo ? 400 : 1000;
    const interval = setInterval(() => {
      audio.playTick();
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 70);

    try {
      const response = await api.playRound({
        userId: user.id,
        gameId: 'lucky_slots',
        stake,
      });

      setTimeout(async () => {
        clearInterval(interval);
        const { reel1, reel2, reel3 } = response.outcomeDetails;
        setReels([reel1, reel2, reel3]);
        setIsSpinning(false);
        const updatedWallet = await refreshWallet();

        if (response.result === 'WIN' && response.payout > 0) {
          if (response.multiplier >= 10) {
            audio.playJackpot();
          } else {
            audio.playWin();
          }
          setWinModal({
            betAmount: stake,
            winAmount: response.payout,
            newBalance: updatedWallet?.availableGameCredits ?? response.updatedBalance,
          });
        } else {
          audio.playLoss();
        }
      }, spinDuration);
    } catch (err: any) {
      clearInterval(interval);
      setIsSpinning(false);
      setError(err.message || 'Game resolution error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-center space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            audio.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141724] border border-white/5 text-xs text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>
        <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
          LUCKY SLOTS VIP
        </span>
        <div className="px-3 py-1 rounded-full bg-[#151824] border border-[#D4AF37]/35 text-xs font-mono font-bold text-[#F5C542]">
          ₹{wallet?.availableGameCredits.toLocaleString() ?? '0'}
        </div>
      </div>

      {/* JACKPOT Meter (Screen 9) */}
      <div className="relative rounded-2xl p-3 bg-gradient-to-r from-[#201738] via-[#2F1D4D] to-[#1C1430] border-2 border-[#D4AF37]/50 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C542]/15 rounded-full blur-2xl pointer-events-none" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C542] block">
          ★ JACKPOT ★
        </span>
        <div className="text-2xl font-black font-mono text-white tracking-wider animate-pulse">
          ₹1,25,678.50
        </div>
      </div>

      {/* 3-Reel Slots Machine Canvas (Screen 9) */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-b from-[#1C2034] via-[#11131E] to-[#0A0C13] border-4 border-[#D4AF37]/50 shadow-2xl overflow-hidden">
        {/* Machine gold bevel */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-[#090A10] border-2 border-white/10 shadow-inner">
          {reels.map((sym, idx) => (
            <div
              key={idx}
              className={`h-28 rounded-xl bg-gradient-to-b from-[#171A2A] via-[#10121C] to-[#0D0F18] border border-white/10 flex items-center justify-center text-5xl shadow-md transition-all ${
                isSpinning ? 'blur-[0.5px] scale-95' : 'scale-100'
              }`}
            >
              {sym}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Bet Controls (Screen 9) */}
      <div className="p-4 rounded-2xl bg-[#131622] border border-white/10 space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">Bet Amount (₹):</span>
          <div className="flex items-center gap-1">
            <button
              disabled={isSpinning}
              onClick={() => setStake((prev) => Math.max(10, prev - 10))}
              className="w-7 h-7 rounded-lg bg-[#1C2030] text-white font-bold flex items-center justify-center active:scale-95"
            >
              -
            </button>
            <span className="w-12 text-center font-mono font-bold text-white text-xs">
              ₹{stake}
            </span>
            <button
              disabled={isSpinning}
              onClick={() => setStake((prev) => prev + 10)}
              className="w-7 h-7 rounded-lg bg-[#1C2030] text-white font-bold flex items-center justify-center active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Preset Pills */}
        <div className="grid grid-cols-4 gap-2">
          {stakes.map((val) => (
            <button
              key={val}
              disabled={isSpinning}
              onClick={() => {
                audio.playChip();
                setStake(val);
              }}
              className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                stake === val
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-black'
                  : 'bg-[#1C2030] text-white border-white/5'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        {/* Big SPIN Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full h-14 rounded-2xl gold-gradient-btn text-lg font-black tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#D4AF37]/30 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
        >
          <span>{isSpinning ? 'SPINNING...' : 'SPIN'}</span>
        </button>

        {/* Auto Spin and Turbo Toggles (Screen 9) */}
        <div className="flex items-center justify-around pt-1 text-xs text-[#9CA3AF]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isAutoSpin}
              onChange={(e) => setIsAutoSpin(e.target.checked)}
              className="rounded accent-[#D4AF37]"
            />
            <span className={isAutoSpin ? 'text-[#F5C542] font-bold' : ''}>Auto Spin</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isTurbo}
              onChange={(e) => setIsTurbo(e.target.checked)}
              className="rounded accent-[#D4AF37]"
            />
            <span className={isTurbo ? 'text-amber-400 font-bold' : ''}>⚡ Turbo</span>
          </label>
        </div>
      </div>

      {/* Screen 10: Game Result Modal */}
      {winModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1C2034] via-[#121422] to-[#0A0C13] border-2 border-[#D4AF37] shadow-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#997A15] via-[#F5C542] to-[#FFE885] flex items-center justify-center text-black shadow-xl">
              <Crown className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-display font-black text-white">
                Congratulations!
              </h3>
              <p className="text-2xl font-black font-mono text-[#F5C542]">
                You Won ₹{winModal.winAmount.toFixed(2)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0D0F18] border border-white/5 space-y-2 text-xs text-left">
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span>Bet Amount</span>
                <span className="font-mono text-white font-bold">₹{winModal.betAmount}</span>
              </div>
              <div className="flex items-center justify-between text-[#9CA3AF]">
                <span>Win Amount</span>
                <span className="font-mono text-emerald-400 font-bold">+₹{winModal.winAmount}</span>
              </div>
              <div className="flex items-center justify-between text-[#9CA3AF] pt-1.5 border-t border-white/5">
                <span>New Balance</span>
                <span className="font-mono text-[#F5C542] font-black">₹{winModal.newBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setWinModal(null);
                  handleSpin();
                }}
                className="w-full h-11 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center shadow-md active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  setWinModal(null);
                  onBack();
                }}
                className="w-full h-10 rounded-xl bg-[#1C2032] text-xs font-bold text-white hover:bg-[#252B42]"
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
