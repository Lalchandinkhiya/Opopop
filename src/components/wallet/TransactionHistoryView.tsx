import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LedgerEntry } from '../../types';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { audio } from '../../services/audioService';

interface TransactionHistoryViewProps {
  onBack?: () => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({ onBack }) => {
  const { user, setActiveTab } = useAuth();
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW' | 'BONUS'>('ALL');

  useEffect(() => {
    if (user) {
      api.getLedger(user.id).then((items) => {
        if (items.length === 0) {
          const initialMock: LedgerEntry[] = [
            {
              ledgerId: 'ldg_1',
              userId: user.id,
              type: 'DEPOSIT_CREDIT',
              amount: 500,
              previousBalance: 50,
              newBalance: 550,
              referenceId: 'PAY_UPI_123',
              source: 'SANDBOX_UPI',
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              status: 'COMPLETED',
              description: 'Add Money via Razorpay UPI',
            },
            {
              ledgerId: 'ldg_2',
              userId: user.id,
              type: 'ADMIN_ADJUSTMENT',
              amount: -1000,
              previousBalance: 1550,
              newBalance: 550,
              referenceId: 'REQ_WDR_789',
              source: 'WITHDRAW_ESCROW',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              status: 'PENDING',
              description: 'Withdrawal to Bank Account',
            },
            {
              ledgerId: 'ldg_3',
              userId: user.id,
              type: 'SIGNUP_BONUS',
              amount: 50,
              previousBalance: 0,
              newBalance: 50,
              referenceId: 'BONUS_WELCOME',
              source: 'REGISTRATION_GRANT',
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              status: 'COMPLETED',
              description: 'Signup Promotional Bonus',
            },
          ];
          setLedgers(initialMock);
        } else {
          setLedgers(items);
        }
      });
    }
  }, [user]);

  const filtered = ledgers.filter((l) => {
    if (filter === 'DEPOSIT') return l.type === 'DEPOSIT_CREDIT';
    if (filter === 'WITHDRAW') return l.type === 'ADMIN_ADJUSTMENT' && l.amount < 0;
    if (filter === 'BONUS') return l.type === 'SIGNUP_BONUS' || l.type === 'PROMOTIONAL_CREDIT';
    return true;
  });

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
          TRANSACTION HISTORY
        </span>
      </div>

      {/* Tabs: All, Deposit, Withdraw, Bonus */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#141724] border border-white/5">
        {(['ALL', 'DEPOSIT', 'WITHDRAW', 'BONUS'] as const).map((tab) => (
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
            {tab === 'ALL' ? 'All' : tab === 'DEPOSIT' ? 'Deposit' : tab === 'WITHDRAW' ? 'Withdraw' : 'Bonus'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9CA3AF] rounded-2xl bg-[#131622] border border-white/5">
            No transaction records found matching this category.
          </div>
        ) : (
          filtered.map((item) => {
            const isPositive = item.amount > 0;
            const isPending = item.status === 'PENDING';

            return (
              <div
                key={item.ledgerId}
                className="p-3.5 rounded-2xl bg-[#131622] border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPositive
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : isPending
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white block">
                      {item.description || item.type}
                    </h4>
                    <span className="text-[10px] text-[#9CA3AF] font-mono">
                      {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ·{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-black font-mono block ${
                      isPositive ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-red-400'
                    }`}
                  >
                    {isPositive ? `+₹${item.amount.toLocaleString()}` : `-₹${Math.abs(item.amount).toLocaleString()}`}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isPending
                        ? 'bg-amber-500/20 text-amber-300'
                        : isPositive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-500/20 text-slate-300'
                    }`}
                  >
                    {isPending ? 'Pending' : 'Success'}
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
