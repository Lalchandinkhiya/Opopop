import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TaskItem } from '../../types';
import {
  Calendar,
  Gamepad2,
  Users,
  PlayCircle,
  UserCheck,
  Sparkles,
  Gift,
  CheckCircle2,
  ArrowRight,
  Clock,
  Trophy,
} from 'lucide-react';
import { audio } from '../../services/audioService';

export const TasksView: React.FC = () => {
  const { user, wallet, refreshWallet, setActiveTab } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'DAILY' | 'OFFER' | 'SPECIAL'>('DAILY');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadTasks = async () => {
    if (!user) return;
    const items = await api.getTasks(user.id);
    setTasks(items);
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const handleClaim = async (task: TaskItem) => {
    if (!user || task.isClaimed || !task.isCompleted) return;
    setClaimingId(task.id);
    try {
      audio.playJackpot();
      const res = await api.claimTask(user.id, task.id);
      await refreshWallet();
      setSuccessMessage(`🎉 Claimed +₹${res.rewardCoins} reward for "${task.title}"!`);
      await loadTasks();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      audio.playLoss();
      console.error(e);
    } finally {
      setClaimingId(null);
    }
  };

  const getTaskIcon = (name: string) => {
    switch (name) {
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-purple-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-amber-400" />;
      case 'PlayCircle':
        return <PlayCircle className="w-5 h-5 text-emerald-400" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-pink-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#F5C542]" />;
    }
  };

  const filteredTasks = tasks.filter((t) => t.category === activeCategory);

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-left space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F5C542]" />
            TASKS & EARN
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Complete easy missions and collect instant ₹ coin rewards
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-[#151824] border border-[#D4AF37]/35 text-xs font-mono font-bold text-[#F5C542]">
          ₹{wallet?.availableGameCredits.toLocaleString() ?? '0'}
        </div>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category Tabs: Daily Tasks, Offer Tasks, Special */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#141724] border border-white/5">
        {(['DAILY', 'OFFER', 'SPECIAL'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              audio.playClick();
              setActiveCategory(cat);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-black'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            {cat === 'DAILY' ? 'Daily Tasks' : cat === 'OFFER' ? 'Offer Tasks' : 'Special'}
          </button>
        ))}
      </div>

      {/* Complete All Tasks Banner */}
      <div className="relative rounded-2xl p-4 bg-gradient-to-r from-[#2A1B4E] via-[#1E1C38] to-[#121422] border border-purple-500/40 overflow-hidden shadow-lg flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
            SUPER CHALLENGE
          </span>
          <h4 className="text-sm font-black text-white">
            Complete All Tasks Earn Extra 50 Coins
          </h4>
          <p className="text-[10px] text-purple-200/70">
            Resets daily at 00:00 AM server time
          </p>
        </div>
        <button
          onClick={() => {
            audio.playClick();
            setActiveCategory('DAILY');
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black shrink-0 shadow-md active:scale-95"
        >
          Go Now
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const isDone = task.isCompleted;
          const isClaimed = task.isClaimed;

          return (
            <div
              key={task.id}
              className="p-3.5 rounded-2xl bg-[#131622] border border-white/5 hover:border-[#D4AF37]/30 transition-all flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1A1F30] border border-white/10 flex items-center justify-center shrink-0">
                  {getTaskIcon(task.iconName)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {task.title}
                    </h4>
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[9px] font-black">
                      +{task.rewardCoins} Coins
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] leading-tight">
                    {task.description}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-[#F5C542] rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (task.currentProgress / task.targetProgress) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-[#9CA3AF] font-mono">
                      {task.currentProgress}/{task.targetProgress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isClaimed ? (
                <span className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-500 text-xs font-bold shrink-0">
                  Claimed
                </span>
              ) : isDone ? (
                <button
                  onClick={() => handleClaim(task)}
                  disabled={claimingId === task.id}
                  className="px-3.5 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold shrink-0 shadow-md active:scale-95 transition-transform"
                >
                  {claimingId === task.id ? 'Claiming...' : 'Claim'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    audio.playClick();
                    if (task.id === 'task_play_5') setActiveTab('GAMES');
                    if (task.id === 'task_refer_1') setActiveTab('REFER' as any);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1C2132] border border-white/10 hover:border-white/25 text-white text-xs font-bold shrink-0 active:scale-95"
                >
                  {task.actionText}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
