import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const isXl = size === 'xl';

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Luxury Casino Shield / Ace Insignia */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1C1F2E] via-[#0E1017] to-[#050608] border border-[#D4AF37]/30 shadow-lg shadow-black/50 ${
          isSm ? 'w-8 h-8' : isLg ? 'w-12 h-12' : isXl ? 'w-16 h-16' : 'w-10 h-10'
        }`}
      >
        {/* Gold inner hairline border */}
        <div className="absolute inset-[2px] rounded-lg border border-[#D4AF37]/20 pointer-events-none" />
        
        {/* Stylized Ace of Spades / Crown Crest */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isSm ? 'w-4 h-4' : isLg ? 'w-6 h-6' : isXl ? 'w-8 h-8' : 'w-5 h-5'}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF1B8" />
              <stop offset="50%" stopColor="#F5C542" />
              <stop offset="100%" stopColor="#997A15" />
            </linearGradient>
          </defs>
          <path d="M12 2L4 9v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-8-7z" fill="url(#goldGradient)" fillOpacity="0.1" />
          <path d="M12 6l3 6-3 3-3-3 3-6z" fill="url(#goldGradient)" />
          <path d="M9 18h6" />
        </svg>

        {/* Ambient subtle amber glow */}
        <div className="absolute -inset-1 bg-[#D4AF37]/10 rounded-xl blur-sm -z-10" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight">
        <span
          className={`font-display font-extrabold tracking-[0.22em] text-[#E5E7EB] uppercase ${
            isSm ? 'text-[11px]' : isLg ? 'text-lg' : isXl ? 'text-2xl' : 'text-sm'
          }`}
        >
          RECOVERY
        </span>
        <span
          className={`font-display font-black tracking-[0.28em] gold-gradient-text uppercase ${
            isSm ? 'text-[9px]' : isLg ? 'text-base' : isXl ? 'text-xl' : 'text-xs'
          }`}
        >
          LOSSS
        </span>
        {showSubtitle && (
          <span className="text-[10px] tracking-widest text-[#9CA3AF] uppercase mt-0.5 font-medium">
            Private Organisation
          </span>
        )}
      </div>
    </div>
  );
};
