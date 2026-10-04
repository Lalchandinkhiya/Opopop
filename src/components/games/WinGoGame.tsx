import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ArrowLeft,
  Timer,
  TrendingUp,
  History,
  AlertCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle2,
  X,
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface WinGoGameProps {
  onBack: () => void;
}

interface WinGoRecord {
  period: string;
  number: number;
  size: 'BIG' | 'SMALL';
  color: 'GREEN' | 'RED' | 'VIOLET' | 'RED_VIOLET' | 'GREEN_VIOLET';
}

export const WinGoGame: React.FC<WinGoGameProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet } = useAuth();

  // Mode: 30s, 1Min, 3Min, 5Min (Tiranga format)
  const [activeInterval, setActiveInterval] = useState<'30s' | '1Min' | '3Min' | '5Min'>('30s');
  const [timeLeft, setTimeLeft] = useState<number>(24);
  const [period, setPeriod] = useState<string>('20261004' + Math.floor(10000 + Math.random() * 89999));

  // Betting sheet popup state
  const [betModalOpen, setBetModalOpen] = useState<boolean>(false);
  const [selectedBet, setSelectedBet] = useState<{
    type: 'COLOR' | 'NUMBER' | 'SIZE';
    value: string | number;
    title: string;
    rate: number;
    color: string;
  } | null>(null);

  const [contractUnit, setContractUnit] = useState<number>(10);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [agreeRules, setAgreeRules] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Active user bets in the current round
  const [currentRoundBets, setCurrentRoundBets] = useState<any[]>([]);

  // Win Modal state
  const [winModalData, setWinModalData] = useState<{
    won: boolean;
    period: string;
    resultNumber: number;
    resultColor: string;
    resultSize: string;
    payout: number;
  } | null>(null);

  // Game trends history
  const [historyList, setHistoryList] = useState<WinGoRecord[]>([
    { period: '202610040842', number: 7, size: 'BIG', color: 'GREEN' },
    { period: '202610040841', number: 2, size: 'SMALL', color: 'RED' },
    { period: '202610040840', number: 0, size: 'SMALL', color: 'RED_VIOLET' },
    { period: '202610040839', number: 8, size: 'BIG', color: 'RED' },
    { period: '202610040838', number: 5, size: 'BIG', color: 'GREEN_VIOLET' },
    { period: '202610040837', number: 3, size: 'SMALL', color: 'GREEN' },
    { period: '202610040836', number: 9, size: 'BIG', color: 'GREEN' },
    { period: '202610040835', number: 4, size: 'SMALL', color: 'RED' },
    { period: '202610040834', number: 1, size: 'SMALL', color: 'GREEN' },
    { period: '202610040833', number: 6, size: 'BIG', color: 'RED' },
  ]);

  const [activeTab, setActiveTab] = useState<'GAME_HISTORY' | 'CHART' | 'MY_BETS'>('GAME_HISTORY');
  const [myBetsList, setMyBetsList] = useState<any[]>([]);

  const totalBetAmount = contractUnit * multiplier;
  const isCountingDownToLock = timeLeft <= 5; // 5-second lock in Tiranga

  // Timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 5) {
          audio.playTick();
        }
        if (prev <= 1) {
          // Resolve round!
          settleRoundAutomatically();
          return activeInterval === '30s' ? 30 : activeInterval === '1Min' ? 60 : 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeInterval, period, currentRoundBets]);

  const settleRoundAutomatically = async () => {
    const num = Math.floor(Math.random() * 10);
    const isGreen = [1, 3, 7, 9].includes(num);
    const isRed = [2, 4, 6, 8].includes(num);
    const isViolet = [0, 5].includes(num);
    const color = isGreen ? 'GREEN' : isRed ? 'RED' : num === 0 ? 'RED_VIOLET' : 'GREEN_VIOLET';
    const size = num >= 5 ? 'BIG' : 'SMALL';

    const settledPeriod = period;
    const nextPeriod = String(Number(period) + 1);

    const newRecord: WinGoRecord = {
      period: settledPeriod,
      number: num,
      color,
      size,
    };

    setHistoryList((prev) => [newRecord, ...prev.slice(0, 19)]);
    setPeriod(nextPeriod);

    // If user has bets on this round, evaluate
    if (currentRoundBets.length > 0) {
      let roundTotalWon = 0;
      let roundTotalLoss = 0;

      for (const b of currentRoundBets) {
        let won = false;
        let mult = 0;

        if (b.type === 'COLOR') {
          if (b.value === 'GREEN' && (isGreen || num === 5)) {
            won = true;
            mult = isGreen ? 2 : 1.5;
          } else if (b.value === 'RED' && (isRed || num === 0)) {
            won = true;
            mult = isRed ? 2 : 1.5;
          } else if (b.value === 'VIOLET' && isViolet) {
            won = true;
            mult = 4.5;
          }
        } else if (b.type === 'NUMBER' && Number(b.value) === num) {
          won = true;
          mult = 9;
        } else if (b.type === 'SIZE' && b.value === size) {
          won = true;
          mult = 2;
        }

        const payout = won ? b.amount * mult : 0;
        if (won) roundTotalWon += payout;
        else roundTotalLoss += b.amount;

        setMyBetsList((prev) => [
          {
            period: settledPeriod,
            select: b.title,
            amount: b.amount,
            status: won ? 'WIN' : 'LOSS',
            payout,
            resultNumber: num,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      }

      // Show Tiranga celebration modal if won
      if (roundTotalWon > 0) {
        audio.playJackpot();
        setWinModalData({
          won: true,
          period: settledPeriod,
          resultNumber: num,
          resultColor: color,
          resultSize: size,
          payout: roundTotalWon,
        });
      } else {
        audio.playLoss();
        setWinModalData({
          won: false,
          period: settledPeriod,
          resultNumber: num,
          resultColor: color,
          resultSize: size,
          payout: 0,
        });
      }

      setCurrentRoundBets([]);
      if (user) {
        refreshWallet();
      }
    }
  };

  const handleOpenBetSheet = (
    type: 'COLOR' | 'NUMBER' | 'SIZE',
    value: string | number,
    title: string,
    rate: number,
    color: string
  ) => {
    if (isCountingDownToLock) {
      audio.playLoss();
      return;
    }
    audio.playChip();
    setSelectedBet({ type, value, title, rate, color });
    setMultiplier(1);
    setBetModalOpen(true);
  };

  const handleConfirmBet = async () => {
    if (!user || !selectedBet || isSubmitting) return;

    if (!agreeRules) {
      setBetError('Please agree to pre-sale rules');
      return;
    }

    if ((wallet?.availableGameCredits ?? 0) < totalBetAmount) {
      audio.playLoss();
      setBetError(`Insufficient balance. You need ₹${totalBetAmount}.`);
      return;
    }

    setBetError(null);
    setIsSubmitting(true);
    try {
      // Deduct atomically via server api
      await api.playRound({
        userId: user.id,
        gameId: 'wingo',
        stake: totalBetAmount,
        gameParams: {
          betType: selectedBet.type,
          value: selectedBet.value,
        },
      });

      audio.playChip();
      // Record bet for current round settlement
      setCurrentRoundBets((prev) => [
        ...prev,
        {
          period,
          type: selectedBet.type,
          value: selectedBet.value,
          title: selectedBet.title,
          amount: totalBetAmount,
        },
      ]);

      await refreshWallet();
      setBetModalOpen(false);
    } catch (err: any) {
      setBetError(err.message || 'Failed to place bet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNumberColorClass = (n: number) => {
    if ([1, 3, 7, 9].includes(n)) return 'bg-[#18B660] text-white shadow-emerald-900/50';
    if ([2, 4, 6, 8].includes(n)) return 'bg-[#FB3444] text-white shadow-red-900/50';
    if (n === 0) return 'bg-gradient-to-tr from-[#FB3444] 50% to-[#B620E0] 50% text-white';
    return 'bg-gradient-to-tr from-[#18B660] 50% to-[#B620E0] 50% text-white';
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#10121A] text-white select-none pb-24 text-left">
      {/* 1. Tiranga Win Go Top App Bar */}
      <div className="sticky top-0 z-30 bg-[#161824] px-4 py-3 border-b border-[#2C3044] flex items-center justify-between">
        <button
          onClick={() => {
            audio.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-display font-black tracking-wider text-sm gold-gradient-text uppercase">
            Win Go
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
            Live 24/7
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-full bg-[#202436] border border-[#D4AF37]/30 text-xs font-mono font-bold text-[#F5C542]">
            ₹{wallet?.availableGameCredits.toLocaleString() ?? '0'}
          </div>
        </div>
      </div>

      {/* 2. Tiranga Time Intervals Segment Bar (30s, 1Min, 3Min, 5Min) */}
      <div className="p-3 bg-[#161824] border-b border-[#262A3D]">
        <div className="grid grid-cols-4 gap-2">
          {(['30s', '1Min', '3Min', '5Min'] as const).map((interval) => (
            <button
              key={interval}
              onClick={() => {
                audio.playClick();
                setActiveInterval(interval);
                setTimeLeft(interval === '30s' ? 30 : interval === '1Min' ? 60 : 180);
              }}
              className={`py-2 px-1 rounded-xl text-center transition-all ${
                activeInterval === interval
                  ? 'bg-gradient-to-b from-[#F5C542] to-[#C99818] text-black font-extrabold shadow-md shadow-[#D4AF37]/30 scale-102'
                  : 'bg-[#202334] text-[#9CA3AF] font-bold hover:text-white border border-white/5'
              }`}
            >
              <Timer className="w-3.5 h-3.5 mx-auto mb-0.5" />
              <span className="text-[11px] block leading-none font-mono">Win Go</span>
              <span className="text-[10px] block mt-0.5 font-mono">{interval}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Round Period Banner & Huge Live Countdown Clock */}
      <div className="m-3 p-4 rounded-2xl bg-gradient-to-r from-[#1E2336] via-[#2A314C] to-[#1E2336] border border-[#D4AF37]/30 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] font-medium">
              <span>Period (दौर)</span>
              <button
                onClick={() => setShowRulesModal(true)}
                className="text-white hover:text-[#F5C542]"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-lg font-black font-mono text-[#F5C542] tracking-wider mt-0.5">
              {period}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#D1D5DB] uppercase tracking-wider block font-semibold mb-1">
              Time Remaining
            </span>
            <div className="flex items-center gap-1 justify-end font-mono">
              <span className="w-8 h-9 rounded-lg bg-[#0F111A] border border-white/10 flex items-center justify-center font-black text-xl text-white shadow-inner">
                0
              </span>
              <span className="w-8 h-9 rounded-lg bg-[#0F111A] border border-white/10 flex items-center justify-center font-black text-xl text-white shadow-inner">
                0
              </span>
              <span className="font-bold text-[#F5C542] text-xl mx-0.5">:</span>
              <span
                className={`w-8 h-9 rounded-lg bg-[#0F111A] border flex items-center justify-center font-black text-xl shadow-inner ${
                  isCountingDownToLock ? 'border-red-500 text-red-500 animate-pulse' : 'border-white/10 text-[#F5C542]'
                }`}
              >
                {String(Math.floor(timeLeft / 10))}
              </span>
              <span
                className={`w-8 h-9 rounded-lg bg-[#0F111A] border flex items-center justify-center font-black text-xl shadow-inner ${
                  isCountingDownToLock ? 'border-red-500 text-red-500 animate-pulse' : 'border-white/10 text-[#F5C542]'
                }`}
              >
                {String(timeLeft % 10)}
              </span>
            </div>
          </div>
        </div>

        {/* 5-Second Lock Warning Overlay */}
        {isCountingDownToLock && (
          <div className="mt-3 py-1 px-3 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center gap-2 text-xs text-red-300 font-bold animate-pulse">
            <span>⚠️ Result drawing in {timeLeft}s (Betting locked)</span>
          </div>
        )}
      </div>

      {/* 4. Last 5 Drawn Balls Row */}
      <div className="px-4 py-1.5 flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#9CA3AF] uppercase font-semibold">Recent Draws:</span>
        <div className="flex items-center gap-2 font-mono">
          {historyList.slice(0, 5).map((h, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${getNumberColorClass(
                h.number
              )}`}
            >
              {h.number}
            </span>
          ))}
        </div>
      </div>

      {/* 5. Authentic Tiranga Betting Area */}
      <div className="m-3 p-4 rounded-3xl bg-[#171926] border border-[#2D3147] shadow-xl space-y-4">
        {/* Row 1: Green, Violet, Red */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => handleOpenBetSheet('COLOR', 'GREEN', 'Green', 2, '#18B660')}
            disabled={isCountingDownToLock}
            className="h-12 rounded-xl bg-gradient-to-r from-[#18B660] to-[#128F4B] text-white font-extrabold text-sm shadow-lg shadow-emerald-950/40 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer disabled:opacity-40"
          >
            <span>Green (हरा)</span>
            <span className="text-[10px] opacity-90 font-mono">2x Multiplier</span>
          </button>

          <button
            onClick={() => handleOpenBetSheet('COLOR', 'VIOLET', 'Violet', 4.5, '#B620E0')}
            disabled={isCountingDownToLock}
            className="h-12 rounded-xl bg-gradient-to-r from-[#B620E0] to-[#8C13AF] text-white font-extrabold text-sm shadow-lg shadow-purple-950/40 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer disabled:opacity-40"
          >
            <span>Violet (बैंगनी)</span>
            <span className="text-[10px] opacity-90 font-mono">4.5x Multiplier</span>
          </button>

          <button
            onClick={() => handleOpenBetSheet('COLOR', 'RED', 'Red', 2, '#FB3444')}
            disabled={isCountingDownToLock}
            className="h-12 rounded-xl bg-gradient-to-r from-[#FB3444] to-[#C91A28] text-white font-extrabold text-sm shadow-lg shadow-red-950/40 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer disabled:opacity-40"
          >
            <span>Red (लाल)</span>
            <span className="text-[10px] opacity-90 font-mono">2x Multiplier</span>
          </button>
        </div>

        {/* Row 2: 10 Number Balls (0 to 9) */}
        <div className="p-3 rounded-2xl bg-[#0F111A] border border-white/5">
          <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] mb-2 font-semibold">
            <span>Direct Number Bet (प्रत्यक्ष अंक)</span>
            <span className="text-[#F5C542] font-bold">9x Huge Win</span>
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() =>
                  handleOpenBetSheet('NUMBER', num, `Number ${num}`, 9, '#F5C542')
                }
                disabled={isCountingDownToLock}
                className={`h-12 rounded-2xl font-black font-mono text-base flex items-center justify-center shadow-lg active:scale-90 transition-transform ${getNumberColorClass(
                  num
                )} disabled:opacity-40 cursor-pointer`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Big (5-9) & Small (0-4) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handleOpenBetSheet('SIZE', 'BIG', 'Big (5-9)', 2, '#F5A623')}
            disabled={isCountingDownToLock}
            className="h-12 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#D98205] text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95 transition-transform disabled:opacity-40 cursor-pointer"
          >
            <span className="text-base">BIG (बड़ा)</span>
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-mono">2x</span>
          </button>

          <button
            onClick={() => handleOpenBetSheet('SIZE', 'SMALL', 'Small (0-4)', 2, '#2196F3')}
            disabled={isCountingDownToLock}
            className="h-12 rounded-xl bg-gradient-to-r from-[#2196F3] to-[#1565C0] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 active:scale-95 transition-transform disabled:opacity-40 cursor-pointer"
          >
            <span className="text-base">SMALL (छोटा)</span>
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-mono">2x</span>
          </button>
        </div>

        {/* Current Round Active Bets in play */}
        {currentRoundBets.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <span className="font-bold block mb-1">Your Bets on Period #{period}:</span>
            <div className="space-y-1">
              {currentRoundBets.map((b, idx) => (
                <div key={idx} className="flex justify-between font-mono">
                  <span>{b.title}</span>
                  <span className="font-bold text-white">₹{b.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Tabs: Game History, Chart, My Bets */}
      <div className="m-3 p-4 rounded-3xl bg-[#161824] border border-[#2D3147] space-y-3">
        <div className="grid grid-cols-3 gap-1 bg-[#10121A] p-1 rounded-xl border border-white/5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('GAME_HISTORY')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'GAME_HISTORY'
                ? 'bg-[#292E44] text-[#F5C542] shadow-sm'
                : 'text-[#9CA3AF]'
            }`}
          >
            Game History
          </button>
          <button
            onClick={() => setActiveTab('CHART')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'CHART'
                ? 'bg-[#292E44] text-[#F5C542] shadow-sm'
                : 'text-[#9CA3AF]'
            }`}
          >
            Trend Chart
          </button>
          <button
            onClick={() => setActiveTab('MY_BETS')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'MY_BETS'
                ? 'bg-[#292E44] text-[#F5C542] shadow-sm'
                : 'text-[#9CA3AF]'
            }`}
          >
            My Bets ({myBetsList.length})
          </button>
        </div>

        {/* Tab 1: Game History */}
        {activeTab === 'GAME_HISTORY' && (
          <div className="divide-y divide-white/5">
            <div className="grid grid-cols-4 text-[10px] text-[#9CA3AF] uppercase font-bold pb-2">
              <span>Period</span>
              <span className="text-center">Number</span>
              <span className="text-center">Big/Small</span>
              <span className="text-right">Color</span>
            </div>
            {historyList.map((h) => (
              <div key={h.period} className="grid grid-cols-4 py-2 text-xs items-center font-mono">
                <span className="text-[#9CA3AF]">{h.period}</span>
                <div className="flex justify-center">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${getNumberColorClass(
                      h.number
                    )}`}
                  >
                    {h.number}
                  </span>
                </div>
                <span
                  className={`text-center font-black ${
                    h.size === 'BIG' ? 'text-amber-400' : 'text-blue-400'
                  }`}
                >
                  {h.size}
                </span>
                <span className="text-right text-[11px] font-sans font-bold text-white">
                  {h.color.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Trend Chart */}
        {activeTab === 'CHART' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#0F111A] text-xs space-y-2">
              <span className="text-[11px] text-[#9CA3AF] font-bold block uppercase">
                Statistic Summary (Last 10 Rounds)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-[#181B28]">
                  <span>BIG Count: </span>
                  <strong className="text-amber-400">
                    {historyList.filter((h) => h.size === 'BIG').length}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-[#181B28]">
                  <span>SMALL Count: </span>
                  <strong className="text-blue-400">
                    {historyList.filter((h) => h.size === 'SMALL').length}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-[#181B28]">
                  <span>GREEN Count: </span>
                  <strong className="text-emerald-400">
                    {historyList.filter((h) => h.color.includes('GREEN')).length}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-[#181B28]">
                  <span>RED Count: </span>
                  <strong className="text-red-400">
                    {historyList.filter((h) => h.color.includes('RED')).length}
                  </strong>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {historyList.slice(0, 8).map((h) => (
                <div key={h.period} className="py-1.5 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9CA3AF]">{h.period.slice(-4)}</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                      <span
                        key={val}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          h.number === val
                            ? getNumberColorClass(val)
                            : 'bg-white/5 text-[#6B7280]'
                        }`}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: My Bets */}
        {activeTab === 'MY_BETS' && (
          <div className="divide-y divide-white/5">
            {myBetsList.length === 0 ? (
              <p className="text-xs text-[#9CA3AF] py-6 text-center">No bets placed in this session yet.</p>
            ) : (
              myBetsList.map((b, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-white block">{b.select}</span>
                    <span className="text-[10px] text-[#9CA3AF]">
                      Period #{b.period} · {b.time}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black text-sm block ${
                        b.status === 'WIN' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {b.status === 'WIN' ? `+₹${b.payout}` : `-₹${b.amount}`}
                    </span>
                    <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">
                      {b.status} (Draw: {b.resultNumber})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 7. Authentic Tiranga Bet Sheet Drawer / Popup */}
      {betModalOpen && selectedBet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#1B1E2C] border-t sm:border border-[#D4AF37]/40 shadow-2xl p-5 space-y-4">
            {/* Header bar with chosen color */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedBet.color }}
                />
                <h3 className="text-sm font-bold text-white">
                  Win Go {activeInterval} · Select {selectedBet.title}
                </h3>
              </div>
              <button
                onClick={() => setBetModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contract Money selector (₹10, ₹100, ₹1000, ₹10000) */}
            <div>
              <span className="text-[11px] text-[#9CA3AF] font-bold uppercase block mb-1.5">
                Balance Unit (इकाई)
              </span>
              <div className="grid grid-cols-4 gap-2 font-mono">
                {[10, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      audio.playClick();
                      setContractUnit(amt);
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      contractUnit === amt
                        ? 'bg-[#D4AF37] text-black shadow-md'
                        : 'bg-[#25293C] text-white border border-white/5'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier / Quantity Stepper */}
            <div>
              <span className="text-[11px] text-[#9CA3AF] font-bold uppercase block mb-1.5">
                Multiplier (गुणांक)
              </span>
              <div className="flex items-center justify-between gap-1.5 mb-2">
                {[1, 5, 10, 20, 50].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      audio.playClick();
                      setMultiplier(m);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold ${
                      multiplier === m
                        ? 'bg-[#F5C542] text-black'
                        : 'bg-[#25293C] text-[#9CA3AF]'
                    }`}
                  >
                    X{m}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#11131E]">
                <button
                  onClick={() => setMultiplier(Math.max(1, multiplier - 1))}
                  className="w-8 h-8 rounded-lg bg-[#272B3E] font-bold text-lg text-white"
                >
                  -
                </button>
                <span className="font-mono font-black text-base text-white">
                  {multiplier}
                </span>
                <button
                  onClick={() => setMultiplier(multiplier + 1)}
                  className="w-8 h-8 rounded-lg bg-[#272B3E] font-bold text-lg text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Calculation & Pre-sale Rules */}
            {betError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
                {betError}
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeRules}
                  onChange={(e) => setAgreeRules(e.target.checked)}
                  className="accent-[#F5C542]"
                />
                <span>I agree to Pre-sale rules</span>
              </label>

              <div className="text-right">
                <span className="text-[10px] text-[#9CA3AF] uppercase block">Total Amount</span>
                <span className="text-lg font-black font-mono text-[#F5C542]">
                  ₹{totalBetAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Confirm Bet CTA */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setBetModalOpen(false)}
                className="py-3 rounded-xl bg-[#25293C] text-xs font-bold text-[#D1D5DB]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBet}
                disabled={isSubmitting}
                className="py-3 rounded-xl gold-gradient-btn text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#D4AF37]/30"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <span>Confirm (₹{totalBetAmount})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Fullscreen Result Celebration Popup */}
      {winModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#22283C] to-[#12141F] border-2 border-[#D4AF37] p-6 text-center space-y-4 shadow-2xl">
            <button
              onClick={() => setWinModalData(null)}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#997A15] via-[#F5C542] to-[#FFF1B8] flex items-center justify-center text-3xl shadow-xl shadow-[#D4AF37]/30">
              {winModalData.won ? '🏆' : '🎲'}
            </div>

            <div>
              <span className="text-xs uppercase font-mono font-bold text-[#F5C542] block">
                Period #{winModalData.period}
              </span>
              <h3 className="text-xl font-display font-black text-white mt-1">
                {winModalData.won ? 'CONGRATULATIONS!' : 'ROUND COMPLETED'}
              </h3>
            </div>

            {/* Winning ball highlight */}
            <div className="p-4 rounded-2xl bg-[#0B0D14] flex items-center justify-around">
              <div>
                <span className="text-[10px] text-[#9CA3AF] uppercase block">Drawn Number</span>
                <span
                  className={`w-10 h-10 mx-auto mt-1 rounded-full flex items-center justify-center font-black text-lg shadow-lg ${getNumberColorClass(
                    winModalData.resultNumber
                  )}`}
                >
                  {winModalData.resultNumber}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#9CA3AF] uppercase block">Size</span>
                <span className="font-mono font-black text-base text-amber-400 mt-2 block">
                  {winModalData.resultSize}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#9CA3AF] uppercase block">Color</span>
                <span className="font-sans font-bold text-xs text-white mt-2 block">
                  {winModalData.resultColor.replace('_', ' ')}
                </span>
              </div>
            </div>

            {winModalData.won ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs text-emerald-400 block font-bold">You Won Payout:</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  +₹{winModalData.payout.toLocaleString()}
                </span>
              </div>
            ) : (
              <p className="text-xs text-[#9CA3AF]">
                Better luck next round! The next period has already started.
              </p>
            )}

            <button
              onClick={() => setWinModalData(null)}
              className="w-full py-3 rounded-xl gold-gradient-btn text-xs font-black uppercase tracking-wider"
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#171B2B] border border-[#D4AF37]/40 p-5 space-y-3 text-left shadow-2xl">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-white">Win Go Pre-Sale Rules</h3>
            <div className="text-xs text-[#D1D5DB] space-y-2 leading-relaxed">
              <p>• 1 round runs continuously based on selected interval (1 min / 3 min / 5 min / 10 min).</p>
              <p>• Betting closes 5 seconds before the countdown ends.</p>
              <p>• Green / Red win gives 2x payout (1.5x on Violet combo).</p>
              <p>• Correct number prediction gives 9x payout!</p>
            </div>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold text-black"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
