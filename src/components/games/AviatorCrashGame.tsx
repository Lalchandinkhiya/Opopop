import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, Rocket, TrendingUp, AlertCircle, RefreshCw, Sparkles, Volume2 } from 'lucide-react';
import { audio } from '../../services/audioService';

interface AviatorCrashGameProps {
  onBack: () => void;
}

export const AviatorCrashGame: React.FC<AviatorCrashGameProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet } = useAuth();

  const [stake, setStake] = useState<number>(20);
  const [gameState, setGameState] = useState<'IDLE' | 'FLYING' | 'CRASHED'>('IDLE');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [recentCrashes, setRecentCrashes] = useState<number[]>([1.45, 2.80, 1.18, 5.42, 1.95, 3.10, 1.05, 8.24]);
  const [error, setError] = useState<string | null>(null);

  const stakes = [10, 20, 50, 100, 200, 500];
  const crashPointRef = useRef<number>(2.0);
  const animationFrameRef = useRef<number | null>(null);

  const startFlight = async () => {
    if (!user || gameState === 'FLYING') return;
    if ((wallet?.availableGameCredits ?? 0) < stake) {
      setError('Insufficient balance in wallet.');
      audio.playLoss();
      return;
    }

    setError(null);
    setHasCashedOut(false);
    setWinAmount(0);

    // Deduct stake from wallet
    try {
      await api.adjustBalance(
        user.id,
        -stake,
        'GAME_STAKE',
        'AVIATOR_CRASH',
        `AV_${Date.now()}`,
        `Aviator bet of ₹${stake}`
      );
      await refreshWallet();
    } catch (err: any) {
      setError(err.message || 'Error placing bet');
      return;
    }

    setHasBet(true);
    setGameState('FLYING');
    setMultiplier(1.0);
    audio.playChip();

    // Determine crash point with house edge: mostly 1.1x to 4x, occasionally 10x+
    const rand = Math.random();
    let crashPoint = 1.05;
    if (rand < 0.1) {
      crashPoint = +(1.0 + Math.random() * 0.15).toFixed(2); // early crash
    } else if (rand < 0.6) {
      crashPoint = +(1.2 + Math.random() * 1.5).toFixed(2); // 1.2 - 2.7x
    } else if (rand < 0.85) {
      crashPoint = +(2.5 + Math.random() * 3.0).toFixed(2); // 2.5 - 5.5x
    } else {
      crashPoint = +(5.0 + Math.random() * 8.0).toFixed(2); // 5.0 - 13x
    }
    crashPointRef.current = crashPoint;

    const startTime = Date.now();

    const loop = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Exponential growth curve: mult = 1 + elapsed^1.5 * 0.4
      const currentMult = +(1.0 + Math.pow(elapsed, 1.45) * 0.35).toFixed(2);

      if (currentMult >= crashPointRef.current) {
        setMultiplier(crashPointRef.current);
        setGameState('CRASHED');
        setHasBet(false);
        audio.playLoss();
        setRecentCrashes((prev) => [crashPointRef.current, ...prev.slice(0, 7)]);
        return;
      }

      setMultiplier(currentMult);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const handleCashOut = async () => {
    if (!user || gameState !== 'FLYING' || !hasBet || hasCashedOut) return;

    if (animationFrameRef.current) {
      // Don't stop flight for visuals, but mark cashed out
    }

    const currentMult = multiplier;
    const payout = Math.floor(stake * currentMult);
    setHasCashedOut(true);
    setWinAmount(payout);
    audio.playWin();

    try {
      await api.adjustBalance(
        user.id,
        payout,
        'GAME_PAYOUT',
        'AVIATOR_CRASH',
        `AV_WIN_${Date.now()}`,
        `Aviator cashout @ ${currentMult}x (+₹${payout})`
      );
      await refreshWallet();
    } catch (err: any) {
      setError(err.message || 'Error processing cashout');
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-3 pb-24 text-left space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141724] border border-white/5 hover:border-white/10 text-xs font-semibold text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Game</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9CA3AF]">Wallet:</span>
          <span className="text-sm font-black font-mono text-[#F5C542]">
            ₹{wallet?.availableGameCredits.toLocaleString() ?? '0'}
          </span>
        </div>
      </div>

      {/* Recent Multipliers Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] uppercase font-bold text-[#9CA3AF] shrink-0 mr-1">History:</span>
        {recentCrashes.map((val, idx) => (
          <span
            key={idx}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
              val >= 2.0
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {val.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Main Flight Canvas / Display */}
      <div className="relative rounded-3xl h-64 sm:h-72 bg-gradient-to-b from-[#0F1422] to-[#07090E] border-2 border-red-500/30 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Multiplier Display */}
        <div className="relative z-10 text-center">
          {gameState === 'CRASHED' ? (
            <div className="animate-bounce">
              <span className="text-4xl sm:text-6xl font-black font-mono text-red-500 tracking-tight drop-shadow-md">
                FLEW AWAY!
              </span>
              <p className="text-sm font-bold text-red-400 mt-1 font-mono">@ {multiplier.toFixed(2)}x</p>
            </div>
          ) : (
            <div className="space-y-1">
              <span
                className={`text-5xl sm:text-7xl font-black font-mono tracking-tight transition-colors ${
                  gameState === 'FLYING' ? 'text-[#F5C542]' : 'text-white'
                }`}
              >
                {multiplier.toFixed(2)}x
              </span>
              {gameState === 'FLYING' && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold animate-pulse">
                  <Rocket className="w-4 h-4" />
                  <span>Plane in Flight...</span>
                </div>
              )}
            </div>
          )}

          {hasCashedOut && (
            <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cashed Out ₹{winAmount}!</span>
            </div>
          )}
        </div>

        {/* Flight Curve / Jet icon */}
        {gameState === 'FLYING' && (
          <div
            className="absolute bottom-10 transition-all duration-75 text-red-500 animate-pulse"
            style={{
              left: `${Math.min(15 + multiplier * 8, 75)}%`,
              bottom: `${Math.min(15 + multiplier * 7, 70)}%`,
              transform: 'rotate(-25deg)',
            }}
          >
            <Rocket className="w-10 h-10 fill-current drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
          </div>
        )}
      </div>

      {/* Bet & Cashout Controls */}
      <div className="p-4 rounded-2xl bg-[#141724] border border-white/10 space-y-3">
        {error && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#D1D5DB]">Select Bet Amount (₹):</span>
          <div className="flex items-center gap-1">
            {stakes.map((val) => (
              <button
                key={val}
                disabled={gameState === 'FLYING'}
                onClick={() => {
                  audio.playClick();
                  setStake(val);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  stake === val
                    ? 'bg-[#D4AF37] text-black font-extrabold shadow-sm'
                    : 'bg-[#1C2030] text-[#9CA3AF] hover:text-white border border-white/5'
                }`}
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Big Action Button: START BET or CASH OUT */}
        {gameState === 'FLYING' && hasBet && !hasCashedOut ? (
          <button
            onClick={handleCashOut}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black text-lg font-black tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-transform cursor-pointer"
          >
            <span>CASH OUT (₹{Math.floor(stake * multiplier)})</span>
          </button>
        ) : (
          <button
            onClick={startFlight}
            disabled={gameState === 'FLYING'}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-lg font-black tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-600/25 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
          >
            <Rocket className="w-5 h-5" />
            <span>{gameState === 'FLYING' ? 'WAIT FOR NEXT ROUND' : `START BET (₹${stake})`}</span>
          </button>
        )}
      </div>
    </div>
  );
};
