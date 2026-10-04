import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { audio } from '../../services/audioService';

interface RoyalRouletteGameProps {
  onBack: () => void;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const RoyalRouletteGame: React.FC<RoyalRouletteGameProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [stake, setStake] = useState<number>(20);
  const [betType, setBetType] = useState<'RED' | 'BLACK' | 'EVEN' | 'ODD' | 'NUMBER'>('RED');
  const [selectedNumber, setSelectedNumber] = useState<number>(7);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lastOutcome, setLastOutcome] = useState<{ number: number; isRed: boolean } | null>(null);
  const [winStatus, setWinStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stakes = [10, 20, 50, 100, 250, 500];

  const handleSpin = async () => {
    if (!user || isSpinning) return;
    if ((wallet?.availableGameCredits ?? 0) < stake) {
      setError('Insufficient Game Credits balance.');
      audio.playLoss();
      return;
    }

    setError(null);
    setWinStatus(null);
    setIsSpinning(true);
    audio.playChip();

    try {
      const response = await api.playRound({
        userId: user.id,
        gameId: 'royal_roulette',
        stake,
        gameParams: {
          betType,
          number: selectedNumber,
        },
      });

      // Wheel spinning visual delay
      let counter = 0;
      const spinInterval = setInterval(() => {
        counter++;
        audio.playTick();
        const randNum = Math.floor(Math.random() * 37);
        setLastOutcome({ number: randNum, isRed: RED_NUMBERS.includes(randNum) });
        if (counter > 12) {
          clearInterval(spinInterval);
          const finalNum = response.outcomeDetails.winningNumber;
          const isRed = response.outcomeDetails.isRed;
          setLastOutcome({ number: finalNum, isRed });
          setIsSpinning(false);
          refreshWallet();

          if (response.result === 'WIN') {
            audio.playWin();
            setWinStatus(`WON ${response.payout} Credits (${response.multiplier}x)!`);
          } else {
            audio.playLoss();
            setWinStatus(`Result: ${finalNum} (${isRed ? 'RED' : finalNum === 0 ? 'ZERO' : 'BLACK'}). Better luck next round.`);
          }
        }
      }, 90);
    } catch (err: any) {
      setIsSpinning(false);
      setError(err.message || 'Roulette resolution error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            audio.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>
        <span className="text-sm font-display font-bold text-white uppercase tracking-wider">
          Royal Roulette
        </span>
        <div className="px-2.5 py-1 rounded-full bg-[#151824] border border-[#D4AF37]/30 text-xs font-mono text-[#F5C542]">
          {wallet?.availableGameCredits.toLocaleString() ?? '0'} Credits
        </div>
      </div>

      {/* Roulette Wheel Display */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#1C2030] via-[#11131E] to-[#0A0C13] border-2 border-[#D4AF37]/40 shadow-2xl">
        <div className="relative w-44 h-44 mx-auto rounded-full bg-gradient-to-tr from-[#3E2723] via-[#10121A] to-[#000000] border-4 border-[#D4AF37] p-2 flex items-center justify-center shadow-xl">
          <div
            className={`w-36 h-36 rounded-full border-2 border-dashed border-[#F5C542]/50 flex items-center justify-center transition-transform ${
              isSpinning ? 'animate-spin' : ''
            }`}
          >
            <div
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-inner ${
                lastOutcome
                  ? lastOutcome.number === 0
                    ? 'bg-emerald-600'
                    : lastOutcome.isRed
                    ? 'bg-red-600'
                    : 'bg-neutral-900'
                  : 'bg-[#151824]'
              }`}
            >
              <span className="text-2xl font-black font-mono text-white">
                {lastOutcome ? lastOutcome.number : '0'}
              </span>
              <span className="text-[9px] font-bold text-white/80 uppercase">
                {lastOutcome
                  ? lastOutcome.number === 0
                    ? 'GREEN'
                    : lastOutcome.isRed
                    ? 'RED'
                    : 'BLACK'
                  : 'READY'}
              </span>
            </div>
          </div>
        </div>

        {/* Win / Loss message */}
        <div className="h-8 flex items-center justify-center mt-3">
          {winStatus ? (
            <span
              className={`text-xs font-bold ${
                winStatus.startsWith('WON') ? 'text-emerald-400 animate-pulse' : 'text-[#9CA3AF]'
              }`}
            >
              {winStatus}
            </span>
          ) : error ? (
            <div className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          ) : (
            <span className="text-[11px] text-[#9CA3AF]">
              Pick your prediction and place your stake
            </span>
          )}
        </div>

        {/* Bet Type Selection */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => {
                audio.playClick();
                setBetType('RED');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                betType === 'RED'
                  ? 'bg-red-600 text-white ring-2 ring-[#D4AF37]'
                  : 'bg-red-950/60 text-red-200 border border-red-800/40'
              }`}
            >
              RED (2x)
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setBetType('BLACK');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                betType === 'BLACK'
                  ? 'bg-neutral-900 text-white ring-2 ring-[#D4AF37]'
                  : 'bg-neutral-900/60 text-[#D1D5DB] border border-neutral-700/40'
              }`}
            >
              BLACK (2x)
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setBetType('EVEN');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                betType === 'EVEN'
                  ? 'bg-[#D4AF37] text-black ring-2 ring-white'
                  : 'bg-[#181B29] text-[#D1D5DB] border border-white/5'
              }`}
            >
              EVEN (2x)
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setBetType('ODD');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                betType === 'ODD'
                  ? 'bg-[#D4AF37] text-black ring-2 ring-white'
                  : 'bg-[#181B29] text-[#D1D5DB] border border-white/5'
              }`}
            >
              ODD (2x)
            </button>
          </div>

          {/* Stake Selector */}
          <div className="grid grid-cols-6 gap-1.5">
            {stakes.map((val) => (
              <button
                key={val}
                disabled={isSpinning}
                onClick={() => {
                  audio.playClick();
                  setStake(val);
                }}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  stake === val
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-[#181B29] text-[#D1D5DB] border border-white/5'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full h-13 rounded-2xl gold-gradient-btn text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isSpinning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span>SPIN WHEEL ({stake} CREDITS ON {betType})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
