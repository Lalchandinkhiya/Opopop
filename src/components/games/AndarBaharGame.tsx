import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, RefreshCw, Split } from 'lucide-react';
import { audio } from '../../services/audioService';

interface AndarBaharGameProps {
  onBack: () => void;
}

export const AndarBaharGame: React.FC<AndarBaharGameProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [stake, setStake] = useState<number>(20);
  const [chosenSide, setChosenSide] = useState<'ANDAR' | 'BAHAR'>('ANDAR');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [winningSide, setWinningSide] = useState<'ANDAR' | 'BAHAR' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stakes = [10, 20, 50, 100, 250];

  const handlePlay = async () => {
    if (!user || isPlaying) return;
    if ((wallet?.availableGameCredits ?? 0) < stake) {
      setError('Insufficient Game Credits balance.');
      audio.playLoss();
      return;
    }

    setError(null);
    setGameResult(null);
    setWinningSide(null);
    setIsPlaying(true);
    audio.playChip();

    try {
      const response = await api.playRound({
        userId: user.id,
        gameId: 'andar_bahar',
        stake,
        gameParams: { side: chosenSide },
      });

      // Quick shuffle simulation
      let toggles = 0;
      const flipTimer = setInterval(() => {
        toggles++;
        audio.playTick();
        setWinningSide(toggles % 2 === 0 ? 'ANDAR' : 'BAHAR');
        if (toggles > 10) {
          clearInterval(flipTimer);
          const winSide = response.outcomeDetails.winningSide;
          setWinningSide(winSide);
          setIsPlaying(false);
          refreshWallet();

          if (response.result === 'WIN') {
            audio.playWin();
            setGameResult(`WON ${response.payout} Credits on ${winSide}! (${response.multiplier}x)`);
          } else {
            audio.playLoss();
            setGameResult(`Card matched on ${winSide}. Better luck next round.`);
          }
        }
      }, 90);
    } catch (err: any) {
      setIsPlaying(false);
      setError(err.message || 'Game resolution error');
    }
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
          Andar Bahar
        </span>
        <div className="px-2.5 py-1 rounded-full bg-[#151824] border border-[#D4AF37]/30 text-xs font-mono text-[#F5C542]">
          {wallet?.availableGameCredits.toLocaleString() ?? '0'} Credits
        </div>
      </div>

      <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#1C2030] via-[#11131E] to-[#0A0C13] border-2 border-[#D4AF37]/40 shadow-2xl space-y-5">
        {/* Center Joker Card */}
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#D1D5DB] font-semibold block mb-1">
            Opening Joker Card
          </span>
          <div className="w-16 h-22 mx-auto rounded-xl bg-white text-black border-2 border-[#D4AF37] shadow-xl flex flex-col justify-between p-1 font-bold">
            <span className="text-xs text-red-600">K</span>
            <span className="text-2xl text-center text-red-600">♦</span>
            <span className="text-xs text-right text-red-600">K</span>
          </div>
        </div>

        {/* Andar vs Bahar Spotlights */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              audio.playClick();
              setChosenSide('ANDAR');
            }}
            className={`p-4 rounded-2xl border text-center transition-all ${
              chosenSide === 'ANDAR'
                ? 'bg-gradient-to-b from-[#8B5CF6]/30 to-[#8B5CF6]/10 border-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/20'
                : 'bg-[#151824] border-white/5 opacity-70'
            } ${winningSide === 'ANDAR' ? 'ring-2 ring-emerald-400' : ''}`}
          >
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              ANDAR (अंदर)
            </h4>
            <p className="text-[10px] text-[#9CA3AF] mt-1 font-mono">1.95x Payout</p>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setChosenSide('BAHAR');
            }}
            className={`p-4 rounded-2xl border text-center transition-all ${
              chosenSide === 'BAHAR'
                ? 'bg-gradient-to-b from-[#F5C542]/30 to-[#F5C542]/10 border-[#F5C542] shadow-lg shadow-[#F5C542]/20'
                : 'bg-[#151824] border-white/5 opacity-70'
            } ${winningSide === 'BAHAR' ? 'ring-2 ring-emerald-400' : ''}`}
          >
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              BAHAR (बाहर)
            </h4>
            <p className="text-[10px] text-[#9CA3AF] mt-1 font-mono">2.00x Payout</p>
          </button>
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
            <span className="text-[11px] text-[#9CA3AF]">
              Select Andar or Bahar to receive matching card first
            </span>
          )}
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
            onClick={handlePlay}
            disabled={isPlaying}
            className="w-full h-13 rounded-2xl gold-gradient-btn text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isPlaying ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>BET ON {chosenSide} ({stake} CREDITS)</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
