import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Bell, Gift, ShieldAlert, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { audio } from '../../services/audioService';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'SIGNUP_BONUS':
        return <Gift className="w-4 h-4 text-[#F5C542]" />;
      case 'SECURITY_ALERT':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'REQUEST_STATUS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#11131C] border border-[#D4AF37]/30 shadow-2xl p-5 text-left max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#F5C542]" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Notifications
            </h3>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto divide-y divide-white/5 my-2 flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9CA3AF]">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="py-3 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#181B2A] mt-0.5 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <p className="text-[11px] text-[#D1D5DB] leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-[#9CA3AF] font-mono block pt-1">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
