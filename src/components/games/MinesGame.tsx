import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, Bomb, Diamond, Sparkles, AlertCircle, RefreshCw, Trophy } from 'lucide-react';
import { audio } from '../../services/audioService';

interface MinesGameProps {
  onBack: () => void;
}

const MULTIPLIERS = [1.15, 1.35, 1.62, 1.98, 2.45, 3.10, 4.05, 5.45, 7.60, 11.0, 16.8, 27.5];

export const MinesGame: React.FC<MinesGameProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet } = useAuth();

  const [stake, setStake] = useState<number>(20);
  const [mineCount, setMineCount] = useState<number>(3); // 3 mines on 25 tiles
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [grid, setGrid] = useState<Array<{ isMine: boolean; revealed: boolean }>>(
    Array(25).fill({ isMine: false, revealed: false })
  );
  const [gemsFound, setGemsFound] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [winPayout, setWinPayout] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const stakes = [10, 20, 50, 100, 200, 500];

  const currentMultiplier = gemsFound > 0 ? MULTIPLIERS[Math.min(gemsFound - 1, MULTIPLIERS.length - 1)] : 1.0;
  const currentCashoutValue = Math.floor(stake * currentMultiplier);

  const startGame = async () => {
    if (!user || isPlaying) return;
    if ((wallet?.availableGameCredits ?? 0) < stake) {
      setError('Insufficient wallet balance.');
      audio.playLoss();
      return;
    }

    setError(null);
    setHasWon(false);
    setIsGameOver(false);
    setGemsFound(0);
    setWinPayout(0);

    // Deduct stake
    try {
      await api.adjustBalance(
        user.id,
        -stake,
        'GAME_STAKE',
        'MINES_ARCADE',
        `MINE_${Date.now()}`,
        `Mines bet of ₹${stake} (${mineCount} mines)`
      );
      await refreshWallet();
    } catch (err: any) {
      setError(err.message || 'Error placing bet');
      return;
    }

    // Generate random mines on 25 tiles
    const newGrid = Array(25).fill(null).map(() => ({ isMine: false, revealed: false }));
    let placedMines = 0;
    while (placedMines < mineCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!newGrid[idx].isMine) {
        newGrid[idx].isMine = true;
        placedMines++;
      }
    }

    setGrid(newGrid);
    setIsPlaying(true);
    audio.playChip();
  };

  const handleTileClick = async (index: number) => {
    if (!isPlaying || isGameOver || grid[index].revealed) return;

    const tile = grid[index];
    const newGrid = [...grid];
    newGrid[index] = { ...tile, revealed: true };

    if (tile.isMine) {
      // Hit a mine! Game Over!
      // Reveal all mines
      const revealedAll = newGrid.map((t) => ({ ...t, revealed: true }));
      setGrid(revealedAll);
      setIsPlaying(false);
      setIsGameOver(true);
      setHasWon(false);
      audio.playLoss();
      return;
    }

    // Found diamond!
    audio.playWin();
    const newGems = gemsFound + 1;
    setGemsFound(newGems);
    setGrid(newGrid);
  };

  const handleCashout = async () => {
    if (!user || !isPlaying || gemsFound === 0) return;

    const payout = currentCashoutValue;
    setIsPlaying(false);
    setIsGameOver(true);
    setHasWon(true);
    setWinPayout(payout);
    audio.playJackpot();

    // Reveal rest of grid
    setGrid((prev) => prev.map((t) => ({ ...t, revealed: true })));

    try {
      await api.adjustBalance(
        user.id,
        payout,
        'GAME_PAYOUT',
        'MINES_ARCADE',
        `MINE_WIN_${Date.now()}`,
        `Mines Cashout @ ${currentMultiplier}x (+₹${payout})`
      );
      await refreshWallet();
    } catch (err: any) {
      setError(err.message || 'Error adding winnings');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-left space-y-4">
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

      {/* Info Bar */}
      <div className="p-3 rounded-2xl bg-[#141724] border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block">Gems Found</span>
          <span className="text-base font-extrabold font-mono text-emerald-400">
            {gemsFound} / {25 - mineCount}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block">Next Multiplier</span>
          <span className="text-base font-extrabold font-mono text-[#F5C542]">
            {isPlaying ? `${currentMultiplier.toFixed(2)}x` : '-'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block">Cashout Amount</span>
          <span className="text-base font-extrabold font-mono text-white">
            ₹{isPlaying && gemsFound > 0 ? currentCashoutValue : 0}
          </span>
        </div>
      </div>

      {/* 5x5 Mines Grid */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-b from-[#141724] to-[#0A0C13] border-2 border-[#D4AF37]/30 shadow-2xl">
        <div className="grid grid-cols-5 gap-2">
          {grid.map((tile, idx) => (
            <button
              key={idx}
              disabled={!isPlaying || tile.revealed}
              onClick={() => handleTileClick(idx)}
              className={`aspect-square rounded-2xl font-bold flex items-center justify-center transition-all ${
                tile.revealed
                  ? tile.isMine
                    ? 'bg-red-600/30 border-2 border-red-500 text-red-400'
                    : 'bg-emerald-600/30 border-2 border-emerald-400 text-emerald-300'
                  : isPlaying
                  ? 'bg-[#1C2032] hover:bg-[#252B42] border border-white/10 active:scale-95 cursor-pointer'
                  : 'bg-[#161926] border border-white/5 opacity-60'
              }`}
            >
              {tile.revealed ? (
                tile.isMine ? (
                  <Bomb className="w-5 h-5 animate-pulse" />
                ) : (
                  <Diamond className="w-5 h-5 fill-current animate-bounce" />
                )
              ) : (
                <span className="text-slate-600 text-xs">◆</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Result announcement */}
      {isGameOver && (
        <div
          className={`p-3 rounded-2xl text-center text-xs font-bold border ${
            hasWon
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/20 border-red-500/40 text-red-300'
          }`}
        >
          {hasWon ? `🎉 You Cashed Out ₹${winPayout} successfully!` : '💥 BOOM! You hit a mine. Better luck next round!'}
        </div>
      )}

      {/* Stake & Controls */}
      <div className="p-4 rounded-2xl bg-[#141724] border border-white/10 space-y-3">
        {error && (
          <div className="p-2 rounded-xl bg-red-500/10 text-xs text-red-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#D1D5DB]">Bet (₹):</span>
          <div className="flex items-center gap-1">
            {stakes.map((val) => (
              <button
                key={val}
                disabled={isPlaying}
                onClick={() => {
                  audio.playClick();
                  setStake(val);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  stake === val
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-[#1C2030] text-[#9CA3AF] border border-white/5'
                }`}
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>

        {isPlaying && gemsFound > 0 ? (
          <button
            onClick={handleCashout}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-black text-sm font-black tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>CASH OUT ₹{currentCashoutValue}</span>
          </button>
        ) : (
          <button
            onClick={startGame}
            disabled={isPlaying}
            className="w-full h-12 rounded-xl gold-gradient-btn text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
          >
            <Diamond className="w-4 h-4" />
            <span>START MINES (₹{stake})</span>
          </button>
        )}
      </div>
    </div>
  );
};
