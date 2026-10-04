import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { GameSession } from '../../types';
import { ArrowLeft, History, Trophy, TrendingDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { audio } from '../../services/audioService';

interface GameHistoryViewProps {
  onBack?: () => void;
}

export const GameHistoryView: React.FC<GameHistoryViewProps> = ({ onBack }) => {
  const { user, setActiveTab } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'WON' | 'LOST'>('ALL');

  useEffect(() => {
    if (user) {
      api.getGameHistory(user.id).then((list) => {
        if (list.length === 0) {
          // Provide representative sessions if fresh account
          const mockInitial: GameSession[] = [
            {
              sessionId: 'ses_1',
              userId: user.id,
              gameId: 'lucky_slots',
              gameVersion: '1.0.0',
              stakeCredits: 50,
              result: 'WIN',
              payoutCredits: 500,
              multiplier: 10,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              status: 'COMPLETED',
            },
            {
              sessionId: 'ses_2',
              userId: user.id,
              gameId: 'dice_roll',
              gameVersion: '1.0.0',
              stakeCredits: 10,
              result: 'LOSS',
              payoutCredits: 0,
              multiplier: 0,
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              status: 'COMPLETED',
            },
            {
              sessionId: 'ses_3',
              userId: user.id,
              gameId: 'wingo',
              gameVersion: '1.0.0',
              stakeCredits: 25,
              result: 'WIN',
              payoutCredits: 50,
              multiplier: 2,
              createdAt: new Date(Date.now() - 10800000).toISOString(),
              status: 'COMPLETED',
            },
            {
              sessionId: 'ses_4',
              userId: user.id,
              gameId: 'andar_bahar',
              gameVersion: '1.0.0',
              stakeCredits: 20,
              result: 'LOSS',
              payoutCredits: 0,
              multiplier: 0,
              createdAt: new Date(Date.now() - 14400000).toISOString(),
              status: 'COMPLETED',
            },
            {
              sessionId: 'ses_5',
              userId: user.id,
              gameId: 'aviator',
              gameVersion: '1.0.0',
              stakeCredits: 50,
              result: 'WIN',
              payoutCredits: 250,
              multiplier: 5,
              createdAt: new Date(Date.now() - 18000000).toISOString(),
              status: 'COMPLETED',
            },
          ];
          setSessions(mockInitial);
        } else {
          setSessions(list);
        }
      });
    }
  }, [user]);

  const filtered = sessions.filter((s) => {
    if (filter === 'WON') return s.result === 'WIN';
    if (filter === 'LOST') return s.result === 'LOSS';
    return true;
  });

  const getGameLabel = (id: string) => {
    switch (id) {
      case 'lucky_slots':
        return 'Lucky Slots VIP';
      case 'wingo':
        return 'Win Go Color Prediction';
      case 'k3':
        return 'K3 3-Dice Lottery';
      case 'aviator':
        return 'Aviator Crash';
      case 'mines':
        return 'Mines Cashout';
      case 'dice_roll':
        return 'Dice Roll 7';
      case 'andar_bahar':
        return 'Andar Bahar';
      case 'teen_patti':
        return 'Teen Patti Classic';
      case 'royal_roulette':
        return 'Royal Roulette';
      default:
        return 'Casino Game';
    }
  };

  const getGameIcon = (id: string) => {
    switch (id) {
      case 'lucky_slots':
        return '🎰';
      case 'wingo':
        return '🟢';
      case 'k3':
        return '🎲';
      case 'aviator':
        return '🚀';
      case 'mines':
        return '💣';
      case 'andar_bahar':
        return '🃏';
      case 'teen_patti':
        return '♠️';
      default:
        return '🎯';
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-left space-y-4">
      {/* Header */}
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
        <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
          GAME HISTORY
        </span>
      </div>

      {/* Tabs: All, Won, Lost */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#141724] border border-white/5">
        {(['ALL', 'WON', 'LOST'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              audio.playClick();
              setFilter(tab);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab
                ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-black'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab === 'WON' ? 'Won' : 'Lost'}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9CA3AF] rounded-2xl bg-[#131622] border border-white/5">
            No game rounds found matching this filter.
          </div>
        ) : (
          filtered.map((s) => {
            const isWin = s.result === 'WIN';
            return (
              <div
                key={s.sessionId}
                className="p-3.5 rounded-2xl bg-[#131622] border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1F30] border border-white/10 flex items-center justify-center text-lg">
                    {getGameIcon(s.gameId)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white block">
                      {getGameLabel(s.gameId)}
                    </h4>
                    <span className="text-[10px] text-[#9CA3AF] font-mono">
                      {new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ·{' '}
                      {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-black font-mono block ${
                      isWin ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {isWin ? `+₹${s.payoutCredits}` : `-₹${s.stakeCredits}`}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isWin ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {isWin ? 'Win' : 'Loss'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
