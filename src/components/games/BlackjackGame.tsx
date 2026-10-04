import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, RefreshCw, AlertCircle, Shield } from 'lucide-react';
import { audio } from '../../services/audioService';

interface BlackjackGameProps {
  onBack: () => void;
}

export const BlackjackGame: React.FC<BlackjackGameProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [stake, setStake] = useState<number>(25);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerCards, setPlayerCards] = useState<any[]>([]);
  const [dealerCards, setDealerCards] = useState<any[]>([]);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [dealerScore, setDealerScore] = useState<number>(0);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stakes = [10, 25, 50, 100, 250, 500];

  const handleDeal = async () => {
    if (!user || isPlaying) return;
    if ((wallet?.availableGameCredits ?? 0) < stake) {
      setError('Insufficient Game Credits balance.');
      audio.playLoss();
      return;
    }

    setError(null);
    setGameResult(null);
    setIsPlaying(true);
    audio.playChip();

    try {
      const response = await api.playRound({
        userId: user.id,
        gameId: 'blackjack',
        stake,
      });

      setPlayerCards(response.outcomeDetails.playerCards);
      setDealerCards(response.outcomeDetails.dealerCards);
      setPlayerScore(response.outcomeDetails.playerTotal);
      setDealerScore(response.outcomeDetails.dealerTotal);

      setTimeout(async () => {
        setIsPlaying(false);
        await refreshWallet();

        if (response.result === 'WIN') {
          audio.playWin();
          setGameResult(`VICTORY! Won ${response.payout} Credits (${response.multiplier}x)`);
        } else if (response.result === 'PUSH') {
          audio.playClick();
          setGameResult('PUSH (TIE) - Stake returned');
        } else {
          audio.playLoss();
          setGameResult('DEALER WINS');
        }
      }, 700);
    } catch (err: any) {
      setIsPlaying(false);
      setError(err.message || 'Blackjack resolution error');
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
          Blackjack 21
        </span>
        <div className="px-2.5 py-1 rounded-full bg-[#151824] border border-[#D4AF37]/30 text-xs font-mono text-[#F5C542]">
          {wallet?.availableGameCredits.toLocaleString() ?? '0'} Credits
        </div>
      </div>

      {/* Felt Blackjack Table */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#0F5132]/90 via-[#0A3320] to-[#041A10] border-2 border-[#D4AF37]/40 shadow-2xl space-y-5">
        {/* Dealer Hand */}
        <div>
          <div className="flex items-center justify-between text-xs text-emerald-200 mb-2 font-mono font-semibold">
            <span>DEALER HAND</span>
            <span>Total: {dealerCards.length > 0 ? dealerScore : '--'}</span>
          </div>
          <div className="flex justify-center gap-2 min-h-[72px]">
            {dealerCards.length > 0 ? (
              dealerCards.map((c, i) => (
                <div
                  key={i}
                  className="w-14 h-20 rounded-xl bg-white text-black border border-slate-300 shadow-lg flex flex-col justify-between p-1.5 font-bold"
                >
                  <span className={`text-xs ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {c.rank}
                  </span>
                  <span className={`text-xl text-center ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {c.suit}
                  </span>
                  <span className={`text-xs text-right ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {c.rank}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-14 h-20 rounded-xl bg-[#1C2030] border border-[#D4AF37]/20 flex items-center justify-center text-xs text-[#9CA3AF]">
                Ready
              </div>
            )}
          </div>
        </div>

        {/* Center Status */}
        <div className="py-1">
          {gameResult ? (
            <div
              className={`text-sm font-bold font-mono tracking-wider ${
                gameResult.startsWith('VICTORY') ? 'text-[#F5C542] animate-bounce' : 'text-red-300'
              }`}
            >
              {gameResult}
            </div>
          ) : error ? (
            <div className="text-xs text-red-300 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          ) : (
            <span className="text-[11px] text-emerald-200/70">
              Dealer must draw to 16 and stand on 17
            </span>
          )}
        </div>

        {/* Player Hand */}
        <div>
          <div className="flex items-center justify-between text-xs text-emerald-200 mb-2 font-mono font-semibold">
            <span>PLAYER HAND</span>
            <span>Total: {playerCards.length > 0 ? playerScore : '--'}</span>
          </div>
          <div className="flex justify-center gap-2 min-h-[72px]">
            {playerCards.length > 0 ? (
              playerCards.map((c, i) => (
                <div
                  key={i}
                  className="w-14 h-20 rounded-xl bg-white text-black border border-slate-300 shadow-lg flex flex-col justify-between p-1.5 font-bold"
                >
                  <span className={`text-xs ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {c.rank}
                  </span>
                  <span className={`text-xl text-center ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {c.suit}
                  </span>
                  <span className={`text-xs text-right ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {c.rank}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-14 h-20 rounded-xl bg-[#1C2030] border border-[#D4AF37]/20 flex items-center justify-center text-xs text-[#9CA3AF]">
                Ready
              </div>
            )}
          </div>
        </div>

        {/* Stakes & Action */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="grid grid-cols-6 gap-1.5">
            {stakes.map((val) => (
              <button
                key={val}
                disabled={isPlaying}
                onClick={() => {
                  audio.playClick();
                  setStake(val);
                }}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  stake === val
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-[#081F13] text-emerald-200 border border-emerald-700/30'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <button
            onClick={handleDeal}
            disabled={isPlaying}
            className="w-full h-13 rounded-2xl gold-gradient-btn text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isPlaying ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span>DEAL HAND ({stake} CREDITS)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
