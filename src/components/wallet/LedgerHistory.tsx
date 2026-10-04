import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LedgerEntry } from '../../types';
import { History, ArrowDownLeft, ArrowUpRight, Search, ShieldCheck } from 'lucide-react';
import { audio } from '../../services/audioService';

export const LedgerHistory: React.FC = () => {
  const { user } = useAuth();
  const [ledgers, setLedgers] = useState<LedgerEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'GAMES' | 'CREDITS' | 'REQUESTS'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      api.getLedger(user.id).then((items) => setLedgers(items));
    }
  }, [user]);

  const filtered = ledgers.filter((item) => {
    let matchFilter = true;
    if (filter === 'GAMES') matchFilter = item.type === 'GAME_STAKE' || item.type === 'GAME_PAYOUT';
    if (filter === 'CREDITS') matchFilter = item.type === 'DEPOSIT_CREDIT' || item.type === 'SIGNUP_BONUS';
    if (filter === 'REQUESTS') matchFilter = item.type === 'ADMIN_ADJUSTMENT' || item.type === 'REFUND';

    const matchSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.referenceId.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 pt-3 pb-24 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#F5C542]" />
            TRANSACTION & LEDGER HISTORY
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Cryptographically logged, immutable audit of every Game Credit change
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#141724] p-1 rounded-xl border border-white/5">
          {(['ALL', 'GAMES', 'CREDITS', 'REQUESTS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                audio.playClick();
                setFilter(tab);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-3xl bg-[#12141F] border border-white/5 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#9CA3AF]">
            No ledger transactions found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((item) => {
              const isPositive = item.amount > 0;
              return (
                <div
                  key={item.ledgerId}
                  className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#9CA3AF] mt-1 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-[#181B28] border border-white/5 text-[#E5E7EB]">
                          {item.type}
                        </span>
                        <span>·</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                        <span>·</span>
                        <span className="text-[#6B7280]">Ref: {item.referenceId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-sm tabular-nums block ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isPositive ? `+₹${item.amount.toLocaleString()}` : `-₹${Math.abs(item.amount).toLocaleString()}`}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] font-mono">
                      Bal: ₹{item.newBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
