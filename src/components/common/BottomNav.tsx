import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Dices, CheckSquare, Wallet, UserCircle } from 'lucide-react';
import { audio } from '../../services/audioService';

export const BottomNav: React.FC = () => {
  const { user, activeTab, setActiveTab } = useAuth();

  if (!user) return null;

  const navItems = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'GAMES', label: 'Games', icon: Dices },
    { id: 'TASKS', label: 'Tasks', icon: CheckSquare },
    { id: 'WALLET', label: 'Wallet', icon: Wallet },
    { id: 'PROFILE', label: 'Profile', icon: UserCircle },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0C13]/95 backdrop-blur-md border-t border-[#D4AF37]/20 transition-all select-none max-w-md mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                audio.playClick();
                setActiveTab(item.id as any);
              }}
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all group focus:outline-none cursor-pointer"
              aria-label={item.label}
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-[#997A15]/40 to-[#F5C542]/20 text-[#F5C542] scale-105'
                    : 'text-[#9CA3AF] group-hover:text-[#F3F4F6]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#F5C542] shadow-[0_0_8px_#F5C542]" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 font-medium ${
                  isActive ? 'text-[#F5C542] font-black' : 'text-[#9CA3AF] group-hover:text-white'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
