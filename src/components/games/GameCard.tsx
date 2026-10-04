import React from 'react';
import { GameDefinition } from '../../types';
import { Play, Lock } from 'lucide-react';
import { audio } from '../../services/audioService';

interface GameCardProps {
  game: GameDefinition;
  isLocked?: boolean;
  onPlay: (gameId: string) => void;
  onLockedClick?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isLocked = false,
  onPlay,
  onLockedClick,
}) => {
  const handleClick = () => {
    if (isLocked) {
      audio.playLoss();
      if (onLockedClick) onLockedClick();
    } else {
      audio.playClick();
      onPlay(game.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-2xl p-4 bg-[#141724] border transition-all flex flex-col justify-between text-left cursor-pointer hover:shadow-xl hover:shadow-black/70 ${
        isLocked
          ? 'border-amber-500/30 opacity-90'
          : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/60'
      }`}
    >
      {/* Locked overlay badge if slots requires deposit */}
      {isLocked && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>Deposit to Unlock</span>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md"
            style={{ backgroundColor: `${game.accentColor}25`, color: game.accentColor }}
          >
            ◈
          </div>
          {!isLocked && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#1C2030] text-[#9CA3AF] border border-white/5 uppercase">
              {game.category}
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-white group-hover:text-[#F5C542] transition-colors leading-tight flex items-center gap-1.5">
          <span>{game.name}</span>
          {game.isNew && (
            <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-black uppercase">
              NEW
            </span>
          )}
        </h4>
        <p className="text-[11px] text-[#9CA3AF] line-clamp-2 mt-1 leading-snug">
          {game.shortDescription}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-[#9CA3AF]">
            Min Entry
          </span>
          <span className="text-xs font-bold text-[#F5C542] font-mono tabular-nums">
            ₹{game.minCredits}
          </span>
        </div>

        {isLocked ? (
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>Unlock</span>
          </button>
        ) : (
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg gold-gradient-btn text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>PLAY</span>
          </button>
        )}
      </div>
    </div>
  );
};
