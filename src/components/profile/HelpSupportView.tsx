import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Search,
  HelpCircle,
  MessageSquare,
  Mail,
  Send,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface HelpSupportViewProps {
  onBack?: () => void;
}

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({ onBack }) => {
  const { setActiveTab } = useAuth();
  const [search, setSearch] = useState('');
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'support'; text: string }>>([
    {
      sender: 'support',
      text: 'Hello! Welcome to RECOVERY LOSSS Support. How can our 24/7 team assist you today?',
    },
  ]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    audio.playClick();
    const userMsg = chatMessage.trim();
    setChatLog((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatMessage('');
    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'support',
          text: `Thank you for contacting support regarding "${userMsg}". An agent has logged your ticket (#TKT-${Math.floor(1000 + Math.random() * 9000)}) and will respond shortly.`,
        },
      ]);
      audio.playWin();
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-left space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            audio.playClick();
            if (onBack) onBack();
            else setActiveTab('PROFILE');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141724] border border-white/5 text-xs text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
          HELP & SUPPORT
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help articles..."
          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#131622] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
        />
        <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
      </div>

      {/* Support Cards Grid */}
      <div className="space-y-2.5">
        <div
          onClick={() => {
            audio.playClick();
            setShowFaqModal(true);
          }}
          className="p-4 rounded-2xl bg-[#131622] border border-white/5 hover:border-white/15 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#F5C542] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">FAQ</h4>
              <p className="text-[11px] text-[#9CA3AF]">Find answers to common questions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </div>

        <div
          onClick={() => {
            audio.playClick();
            setShowLiveChat(true);
          }}
          className="p-4 rounded-2xl bg-[#131622] border border-white/5 hover:border-white/15 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Live Chat</h4>
              <p className="text-[11px] text-[#9CA3AF]">Chat with customer support 24/7</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[9px]">ONLINE</span>
        </div>

        <div
          onClick={() => {
            audio.playClick();
            window.location.href = 'mailto:support@recoverylosss.com';
          }}
          className="p-4 rounded-2xl bg-[#131622] border border-white/5 hover:border-white/15 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Contact Us</h4>
              <p className="text-[11px] text-[#9CA3AF]">support@recoverylosss.com</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        </div>

        <div
          onClick={() => {
            audio.playClick();
            window.open('https://t.me/recoverylosss_official', '_blank');
          }}
          className="p-4 rounded-2xl bg-[#131622] border border-white/5 hover:border-white/15 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Telegram Channel</h4>
              <p className="text-[11px] text-[#9CA3AF]">Join for updates & daily promo codes</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-[#9CA3AF]" />
        </div>

        <div className="p-4 rounded-2xl bg-[#131622] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">App Information</h4>
              <p className="text-[11px] text-[#9CA3AF]">Production Build v1.0.0 (Android PWA)</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#F5C542]">v1.0.0</span>
        </div>
      </div>

      {/* Live Chat Modal */}
      {showLiveChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#11131C] border border-[#D4AF37]/30 shadow-2xl p-5 flex flex-col h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white">Live Support Representative</h3>
              </div>
              <button
                onClick={() => setShowLiveChat(false)}
                className="text-xs text-[#9CA3AF] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs">
              {chatLog.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-[#D4AF37] text-black font-semibold rounded-br-none'
                      : 'mr-auto bg-[#1A1F30] text-white border border-white/5 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-10 px-3 rounded-xl bg-[#0B0D14] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl gold-gradient-btn flex items-center justify-center text-black shrink-0"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </form>
          </div>
        </div>
      )}
      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#111422] border border-[#D4AF37]/35 p-5 space-y-3.5 text-left shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Frequently Asked Questions</h3>
              <button
                onClick={() => setShowFaqModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-[#D1D5DB] space-y-2.5">
              <div>
                <strong className="text-white block mb-0.5">Q: What is the minimum deposit?</strong>
                <p className="text-[#9CA3AF]">The minimum deposit is ₹55 via Razorpay BHIM UPI scanner with a 3-minute timer.</p>
              </div>
              <div>
                <strong className="text-white block mb-0.5">Q: How do I unlock withdrawals?</strong>
                <p className="text-[#9CA3AF]">You must complete at least 1 verified deposit of ₹55 or more to unlock slot machines and withdrawal requests.</p>
              </div>
              <div>
                <strong className="text-white block mb-0.5">Q: When are game winnings credited?</strong>
                <p className="text-[#9CA3AF]">Winnings are credited instantly to your wallet ledger upon round settlement.</p>
              </div>
            </div>
            <button
              onClick={() => setShowFaqModal(false)}
              className="w-full py-2 rounded-xl gold-gradient-btn text-xs font-bold text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
