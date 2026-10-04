import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ArrowLeft,
  Dices,
  Timer,
  AlertCircle,
  Sparkles,
  HelpCircle,
  History,
  X,
  CheckCircle2,
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface K3LotteryGameProps {
  onBack: () => void;
}

const SUM_ODDS: Record<number, number> = {
  3: 207.36, 4: 69.12, 5: 34.56, 6: 20.73, 7: 13.82, 8: 9.87, 9: 7.68,
  10: 6.91, 11: 6.91, 12: 7.68, 13: 9.87, 14: 13.82, 15: 20.73, 16: 34.56, 17: 69.12, 18: 207.36,
};

export const K3LotteryGame: React.FC<K3LotteryGameProps> = ({ onBack }) => {
  const { user, wallet, refreshWallet } = useAuth();

  const [activeInterval, setActiveInterval] = useState<'1Min' | '3Min' | '5Min'>('1Min');
  const [timeLeft, setTimeLeft] = useState<number>(35);
  const [period, setPeriod] = useState<string>('20261004' + Math.floor(20000 + Math.random() * 79999));

  const [dice, setDice] = useState<number[]>([2, 5, 4]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [betModalOpen, setBetModalOpen] = useState<boolean>(false);
  const [selectedBet, setSelectedBet] = useState<{
    type: 'TOTAL' | 'SIZE' | 'PARITY' | 'PAIR' | 'TRIPLE';
    value: string | number;
    title: string;
    odds: number;
  } | null>(null);

  const [unit, setUnit] = useState<number>(10);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [currentBets, setCurrentBets] = useState<any[]>([]);
  const [betError, setBetError] = useState<string | null>(null);

  const [winModalData, setWinModalData] = useState<{
    won: boolean;
    period: string;
    dice: number[];
    sum: number;
    size: string;
    payout: number;
  } | null>(null);

  const [historyList, setHistoryList] = useState<
    Array<{ period: string; dice: number[]; sum: number; size: string; parity: string }>
  >([
    { period: '202610041284', dice: [3, 5, 6], sum: 14, size: 'BIG', parity: 'EVEN' },
    { period: '202610041283', dice: [1, 2, 4], sum: 7, size: 'SMALL', parity: 'ODD' },
    { period: '202610041282', dice: [6, 6, 2], sum: 14, size: 'BIG', parity: 'EVEN' },
    { period: '202610041281', dice: [2, 3, 3], sum: 8, size: 'SMALL', parity: 'EVEN' },
    { period: '202610041280', dice: [1, 5, 5], sum: 11, size: 'BIG', parity: 'ODD' },
  ]);

  const [myBetsList, setMyBetsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'MY_BETS'>('HISTORY');

  const totalBetAmount = unit * multiplier;
  const isCountingDownToLock = timeLeft <= 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 5) audio.playTick();
        if (prev <= 1) {
          settleK3Round();
          return activeInterval === '1Min' ? 60 : 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeInterval, period, currentBets]);

  const settleK3Round = () => {
    setIsRolling(true);
    audio.playTick();

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const finalDice = [d1, d2, d3];
    const sum = d1 + d2 + d3;
    const size = sum >= 11 ? 'BIG' : 'SMALL';
    const parity = sum % 2 === 1 ? 'ODD' : 'EVEN';
    const isPair = d1 === d2 || d2 === d3 || d1 === d3;
    const isTriple = d1 === d2 && d2 === d3;

    setTimeout(() => {
      setDice(finalDice);
      setIsRolling(false);
      const settledPeriod = period;
      const nextPeriod = String(Number(period) + 1);

      setHistoryList((prev) => [
        { period: settledPeriod, dice: finalDice, sum, size, parity },
        ...prev.slice(0, 14),
      ]);
      setPeriod(nextPeriod);

      // Evaluate bets
      if (currentBets.length > 0) {
        let totalWin = 0;
        for (const b of currentBets) {
          let won = false;
          let odds = 0;

          if (b.type === 'TOTAL' && Number(b.value) === sum) {
            won = true;
            odds = SUM_ODDS[sum] || 7;
          } else if (b.type === 'SIZE' && b.value === size && !isTriple) {
            won = true;
            odds = 1.92;
          } else if (b.type === 'PARITY' && b.value === parity && !isTriple) {
            won = true;
            odds = 1.92;
          } else if (b.type === 'PAIR' && isPair) {
            won = true;
            odds = 13.82;
          } else if (b.type === 'TRIPLE' && isTriple) {
            won = true;
            odds = 34.56;
          }

          const payout = won ? Math.round(b.amount * odds) : 0;
          if (won) totalWin += payout;

          setMyBetsList((prev) => [
            {
              period: settledPeriod,
              title: b.title,
              amount: b.amount,
              status: won ? 'WIN' : 'LOSS',
              payout,
              sum,
              time: new Date().toLocaleTimeString(),
            },
            ...prev,
          ]);
        }

        if (totalWin > 0) {
          audio.playJackpot();
          setWinModalData({
            won: true,
            period: settledPeriod,
            dice: finalDice,
            sum,
            size,
            payout: totalWin,
          });
        } else {
          audio.playLoss();
          setWinModalData({
            won: false,
            period: settledPeriod,
            dice: finalDice,
            sum,
            size,
            payout: 0,
          });
        }

        setCurrentBets([]);
        if (user) refreshWallet();
      }
    }, 1200);
  };

  const handleOpenBet = (
    type: 'TOTAL' | 'SIZE' | 'PARITY' | 'PAIR' | 'TRIPLE',
    value: string | number,
    title: string,
    odds: number
  ) => {
    if (isCountingDownToLock) return;
    audio.playChip();
    setSelectedBet({ type, value, title, odds });
    setMultiplier(1);
    setBetModalOpen(true);
  };

  const handleConfirmBet = async () => {
    if (!user || !selectedBet) return;
    if ((wallet?.availableGameCredits ?? 0) < totalBetAmount) {
      audio.playLoss();
      setBetError(`Insufficient balance. You need ₹${totalBetAmount}.`);
      return;
    }

    setBetError(null);
    try {
      await api.playRound({
        userId: user.id,
        gameId: 'k3',
        stake: totalBetAmount,
        gameParams: {
          betType: selectedBet.type,
          value: selectedBet.value,
        },
      });

      audio.playChip();
      setCurrentBets((prev) => [
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
    } catch (e: any) {
      setBetError(e.message || 'Bet failed');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#10121A] text-white select-none pb-24 text-left">
      {/* 1. Header */}
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
          <Dices className="w-5 h-5 text-pink-400" />
          <span className="font-display font-black tracking-wider text-sm gold-gradient-text uppercase">
            K3 Lottery
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-[#202436] border border-[#D4AF37]/30 text-xs font-mono font-bold text-[#F5C542]">
          ₹{wallet?.availableGameCredits.toLocaleString() ?? '0'}
        </div>
      </div>

      {/* 2. Intervals Segment */}
      <div className="p-3 bg-[#161824] border-b border-[#262A3D]">
        <div className="grid grid-cols-3 gap-2">
          {(['1Min', '3Min', '5Min'] as const).map((interval) => (
            <button
              key={interval}
              onClick={() => {
                audio.playClick();
                setActiveInterval(interval);
                setTimeLeft(interval === '1Min' ? 60 : 180);
              }}
              className={`py-2 px-1 rounded-xl text-center transition-all ${
                activeInterval === interval
                  ? 'bg-gradient-to-b from-[#F5C542] to-[#C99818] text-black font-extrabold shadow-md shadow-[#D4AF37]/30 scale-102'
                  : 'bg-[#202334] text-[#9CA3AF] font-bold hover:text-white border border-white/5'
              }`}
            >
              <Timer className="w-3.5 h-3.5 mx-auto mb-0.5" />
              <span className="text-[11px] block font-mono">K3 {interval}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Golden Cup & Live Period Header */}
      <div className="m-3 p-4 rounded-3xl bg-gradient-to-b from-[#2E1E34] via-[#1D1726] to-[#120F1A] border-2 border-pink-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-[#9CA3AF] uppercase block font-semibold">Period</span>
            <span className="text-base font-black font-mono text-[#F5C542]">{period}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#9CA3AF] uppercase block font-semibold">Remaining</span>
            <div className="flex items-center gap-1 font-mono justify-end">
              <span className="w-7 h-8 rounded-lg bg-black/60 flex items-center justify-center font-black text-lg text-white">
                0
              </span>
              <span className="w-7 h-8 rounded-lg bg-black/60 flex items-center justify-center font-black text-lg text-white">
                0
              </span>
              <span>:</span>
              <span
                className={`w-7 h-8 rounded-lg bg-black/60 flex items-center justify-center font-black text-lg ${
                  isCountingDownToLock ? 'text-red-500 animate-pulse' : 'text-[#F5C542]'
                }`}
              >
                {String(Math.floor(timeLeft / 10))}
              </span>
              <span
                className={`w-7 h-8 rounded-lg bg-black/60 flex items-center justify-center font-black text-lg ${
                  isCountingDownToLock ? 'text-red-500 animate-pulse' : 'text-[#F5C542]'
                }`}
              >
                {String(timeLeft % 10)}
              </span>
            </div>
          </div>
        </div>

        {/* Dice Cup */}
        <div className="py-2 text-center">
          <div className="flex items-center justify-center gap-3">
            {dice.map((d, idx) => (
              <div
                key={idx}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-b from-white to-slate-200 text-black border-2 border-slate-300 shadow-xl flex items-center justify-center text-3xl font-black transition-transform ${
                  isRolling ? 'animate-bounce scale-90' : 'scale-100'
                }`}
              >
                {d === 1 ? '⚀' : d === 2 ? '⚁' : d === 3 ? '⚂' : d === 4 ? '⚃' : d === 5 ? '⚄' : '⚅'}
              </div>
            ))}
          </div>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs font-mono font-bold">
            <span>Sum: {dice.reduce((a, b) => a + b, 0)}</span>
            <span>·</span>
            <span className={dice.reduce((a, b) => a + b, 0) >= 11 ? 'text-amber-400' : 'text-blue-400'}>
              {dice.reduce((a, b) => a + b, 0) >= 11 ? 'BIG' : 'SMALL'}
            </span>
            <span>·</span>
            <span className="text-pink-400">
              {dice.reduce((a, b) => a + b, 0) % 2 === 1 ? 'ODD' : 'EVEN'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. K3 Betting Pad (Total Sum, Big/Small, Odd/Even, 2 Same, 3 Same) */}
      <div className="m-3 p-4 rounded-3xl bg-[#171926] border border-[#2D3147] space-y-4">
        {/* Big/Small & Odd/Even Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'BIG', sub: '11-18', val: 'BIG', type: 'SIZE' as const },
            { label: 'SMALL', sub: '3-10', val: 'SMALL', type: 'SIZE' as const },
            { label: 'ODD', sub: 'विषम', val: 'ODD', type: 'PARITY' as const },
            { label: 'EVEN', sub: 'सम', val: 'EVEN', type: 'PARITY' as const },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleOpenBet(item.type, item.val, `${item.label} (${item.sub})`, 1.92)}
              disabled={isCountingDownToLock}
              className="py-2.5 rounded-xl bg-[#202538] hover:bg-[#282F48] border border-white/5 text-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <span className="text-xs font-black font-mono text-white block">{item.label}</span>
              <span className="text-[10px] text-[#9CA3AF] block font-mono">{item.sub}</span>
              <span className="text-[9px] text-[#F5C542] block font-mono">1.92x</span>
            </button>
          ))}
        </div>

        {/* Sum Numbers Grid 3 to 18 */}
        <div>
          <span className="text-[11px] font-bold text-[#D1D5DB] uppercase block mb-1.5">
            Total Sum (योग 3 - 18)
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.keys(SUM_ODDS).map((s) => {
              const sumVal = Number(s);
              const odds = SUM_ODDS[sumVal];
              return (
                <button
                  key={sumVal}
                  onClick={() => handleOpenBet('TOTAL', sumVal, `Sum ${sumVal}`, odds)}
                  disabled={isCountingDownToLock}
                  className="py-2 px-1 rounded-xl bg-[#0F111A] border border-white/5 hover:border-pink-500/40 text-center active:scale-95 transition-transform disabled:opacity-40"
                >
                  <span className="text-sm font-black font-mono text-pink-400 block leading-none">
                    {sumVal}
                  </span>
                  <span className="text-[9px] text-[#9CA3AF] font-mono leading-none mt-0.5 block">
                    {odds}x
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 Same & 3 Same */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleOpenBet('PAIR', 'PAIR', '2 Same (Any Pair)', 13.82)}
            disabled={isCountingDownToLock}
            className="py-3 rounded-2xl bg-[#251A30] border border-purple-500/30 text-purple-200 text-xs font-black flex flex-col items-center justify-center disabled:opacity-40"
          >
            <span>2 OF SAME (PAIR)</span>
            <span className="text-[10px] opacity-80 font-mono">13.82x Payout</span>
          </button>

          <button
            onClick={() => handleOpenBet('TRIPLE', 'TRIPLE', '3 Same (Any Triple)', 34.56)}
            disabled={isCountingDownToLock}
            className="py-3 rounded-2xl bg-[#302018] border border-amber-500/30 text-amber-200 text-xs font-black flex flex-col items-center justify-center disabled:opacity-40"
          >
            <span>3 OF SAME (TRIPLE)</span>
            <span className="text-[10px] opacity-80 font-mono">34.56x Payout</span>
          </button>
        </div>
      </div>

      {/* 5. History Table */}
      <div className="m-3 p-4 rounded-3xl bg-[#161824] border border-[#2D3147] space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs font-bold">
          <span className="text-[#F5C542]">K3 Draw Records</span>
          <span className="text-[#9CA3AF] font-mono">Last 5 Rounds</span>
        </div>
        <div className="divide-y divide-white/5 font-mono">
          {historyList.map((h) => (
            <div key={h.period} className="py-2 flex items-center justify-between text-xs">
              <span className="text-[#9CA3AF]">{h.period}</span>
              <div className="flex gap-1">
                {h.dice.map((d, i) => (
                  <span key={i} className="w-5 h-5 rounded bg-white text-black font-bold text-center leading-5 text-[11px]">
                    {d}
                  </span>
                ))}
              </div>
              <span className="font-bold text-white">Sum: {h.sum}</span>
              <span className={h.size === 'BIG' ? 'text-amber-400 font-bold' : 'text-blue-400 font-bold'}>
                {h.size} · {h.parity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Bet Sheet Drawer */}
      {betModalOpen && selectedBet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#1B1E2C] border-t sm:border border-[#D4AF37]/40 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                K3 {activeInterval} · Select {selectedBet.title} ({selectedBet.odds}x)
              </h3>
              <button onClick={() => setBetModalOpen(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

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
                      setUnit(amt);
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      unit === amt ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-[#25293C] text-white border border-white/5'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#9CA3AF] font-bold uppercase block mb-1.5">
                Multiplier (गुणांक)
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#11131E]">
                <button
                  onClick={() => setMultiplier(Math.max(1, multiplier - 1))}
                  className="w-8 h-8 rounded-lg bg-[#272B3E] font-bold text-lg text-white"
                >
                  -
                </button>
                <span className="font-mono font-black text-base text-white">{multiplier}</span>
                <button
                  onClick={() => setMultiplier(multiplier + 1)}
                  className="w-8 h-8 rounded-lg bg-[#272B3E] font-bold text-lg text-white"
                >
                  +
                </button>
              </div>
            </div>

            {betError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
                {betError}
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#9CA3AF]">Total Bet Amount:</span>
              <span className="text-lg font-black font-mono text-[#F5C542]">
                ₹{totalBetAmount.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => setBetModalOpen(false)} className="py-3 rounded-xl bg-[#25293C] text-xs font-bold text-[#D1D5DB]">
                Cancel
              </button>
              <button onClick={handleConfirmBet} className="py-3 rounded-xl gold-gradient-btn text-xs font-black uppercase tracking-wider shadow-lg shadow-[#D4AF37]/30">
                Confirm Bet (₹{totalBetAmount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Celebration Popup */}
      {winModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#22283C] to-[#12141F] border-2 border-[#D4AF37] p-6 text-center space-y-4 shadow-2xl">
            <button onClick={() => setWinModalData(null)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
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

            <div className="p-4 rounded-2xl bg-[#0B0D14] flex items-center justify-around font-mono">
              <div>
                <span className="text-[10px] text-[#9CA3AF] uppercase block">Dice</span>
                <div className="flex gap-1 mt-1">
                  {winModalData.dice.map((d, i) => (
                    <span key={i} className="w-6 h-6 rounded bg-white text-black font-bold text-center leading-6 text-xs">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#9CA3AF] uppercase block">Sum</span>
                <span className="font-black text-lg text-white mt-1 block">{winModalData.sum}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#9CA3AF] uppercase block">Size</span>
                <span className="font-black text-base text-amber-400 mt-1 block">{winModalData.size}</span>
              </div>
            </div>

            {winModalData.won ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs text-emerald-400 block font-bold">You Won:</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  +₹{winModalData.payout.toLocaleString()}
                </span>
              </div>
            ) : (
              <p className="text-xs text-[#9CA3AF]">The next round is live. Best of luck!</p>
            )}

            <button onClick={() => setWinModalData(null)} className="w-full py-3 rounded-xl gold-gradient-btn text-xs font-black uppercase tracking-wider">
              Continue Playing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
