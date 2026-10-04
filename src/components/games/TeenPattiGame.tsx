import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, RefreshCw, AlertCircle, Spade } from 'lucide-react';
import { audio } from '../../services/audioService';

interface TeenPattiGameProps {
  onBack: () => void;
}

export const TeenPattiGame: React.FC<TeenPattiGameProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [stake, setStake] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerHand, setPlayerHand] = useState<any[]>([]);
  const [dealerHand, setDealerHand] = useState<any[]>([]);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stakes = [10, 20, 50, 100, 250];

  const handleShowdown = async () => {
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
        gameId: 'teen_patti',
        stake,
      });

      setPlayerHand(response.outcomeDetails.playerHand);
      setDealerHand(response.outcomeDetails.dealerHand);

      setTimeout(async () => {
        setIsPlaying(false);
        await refreshWallet();

        if (response.result === 'WIN') {
          audio.playWin();
          setGameResult(`WON ${response.payout} Credits (${response.multiplier}x)!`);
        } else {
          audio.playLoss();
          setGameResult('Dealer holds higher hand');
        }
      }, 700);
    } catch (err: any) {
      setIsPlaying(false);
      setError(err.message || 'Teen Patti resolution error');
    }
  };

  const getRankName = (val: number) => {
    if (val === 14) return 'A';
    if (val === 13) return 'K';
    if (val === 12) return 'Q';
    if (val === 11) return 'J';
    return String(val);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 text-center">
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
          Teen Patti
        </span>
        <div className="px-2.5 py-1 rounded-full bg-[#151824] border border-[#D4AF37]/30 text-xs font-mono text-[#F5C542]">
          {wallet?.availableGameCredits.toLocaleString() ?? '0'} Credits
        </div>
      </div>

      <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#1C2030] via-[#11131E] to-[#0A0C13] border-2 border-[#D4AF37]/40 shadow-2xl space-y-5">
        {/* Dealer 3 cards */}
        <div>
          <span className="text-[11px] font-mono text-[#9CA3AF] uppercase tracking-wider block mb-2">
            Opponent Cards
          </span>
          <div className="flex justify-center gap-2">
            {dealerHand.length > 0 ? (
              dealerHand.map((c, i) => (
                <div
                  key={i}
                  className="w-13 h-18 rounded-xl bg-white text-black border border-slate-300 shadow flex flex-col justify-between p-1 font-bold"
                >
                  <span className={`text-[11px] ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {getRankName(c.val)}
                  </span>
                  <span className={`text-lg text-center ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {c.suit}
                  </span>
                  <span className={`text-[11px] text-right ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {getRankName(c.val)}
                  </span>
                </div>
              ))
            ) : (
              [0, 1, 2].map((i) => (
                <div key={i} className="w-13 h-18 rounded-xl bg-[#171B28] border border-[#D4AF37]/20 flex items-center justify-center text-xs text-[#9CA3AF]">
                  🂠
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status */}
        <div className="h-6 flex items-center justify-center">
          {gameResult ? (
            <span className={`text-xs font-bold font-mono ${gameResult.startsWith('WON') ? 'text-emerald-400' : 'text-red-300'}`}>
              {gameResult}
            </span>
          ) : error ? (
            <span className="text-xs text-red-400">{error}</span>
          ) : (
            <span className="text-[11px] text-[#9CA3AF]">Classic 3-card showdown</span>
          )}
        </div>

        {/* Player 3 cards */}
        <div>
          <span className="text-[11px] font-mono text-[#F5C542] uppercase tracking-wider block mb-2">
            Your Cards (Member Hand)
          </span>
          <div className="flex justify-center gap-2">
            {playerHand.length > 0 ? (
              playerHand.map((c, i) => (
                <div
                  key={i}
                  className="w-13 h-18 rounded-xl bg-white text-black border border-slate-300 shadow flex flex-col justify-between p-1 font-bold animate-in fade-in"
                >
                  <span className={`text-[11px] ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {getRankName(c.val)}
                  </span>
                  <span className={`text-lg text-center ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {c.suit}
                  </span>
                  <span className={`text-[11px] text-right ${['♥', '♦'].includes(c.suit) ? 'text-red-600' : 'text-black'}`}>
                    {getRankName(c.val)}
                  </span>
                </div>
              ))
            ) : (
              [0, 1, 2].map((i) => (
                <div key={i} className="w-13 h-18 rounded-xl bg-[#171B28] border border-[#D4AF37]/20 flex items-center justify-center text-xs text-[#9CA3AF]">
                  🂠
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stakes */}
        <div className="pt-3 border-t border-white/5 space-y-3">
          <div className="grid grid-cols-5 gap-1.5">
            {stakes.map((val) => (
              <button
                key={val}
                disabled={isPlaying}
                onClick={() => {
                  audio.playClick();
                  setStake(val);
                }}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  stake === val ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-[#181B29] text-[#D1D5DB] border border-white/5'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <button
            onClick={handleShowdown}
            disabled={isPlaying}
            className="w-full h-13 rounded-2xl gold-gradient-btn text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isPlaying ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>SHOWDOWN ({stake} CREDITS)</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
