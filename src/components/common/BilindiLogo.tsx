import React from 'react';

interface BilindiLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export const BILINDI_LOGO_JPG = '/ic_logo_bilindi.jpg';

export const BilindiLogo: React.FC<BilindiLogoProps> = ({
  size = 40,
  showWordmark = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="rounded-xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center bg-white dark:bg-[#242526] border border-slate-100 dark:border-[#3e4042]"
      >
        <img
          src={BILINDI_LOGO_JPG}
          alt="BilindiWall Logo"
          className="w-full h-full object-contain p-0.5 block"
          loading="eager"
          decoding="async"
        />
      </div>

      {showWordmark && (
        <div className="flex items-center text-lg sm:text-xl font-black tracking-tight leading-none">
          <span className="text-[#0052CC]">Bilindi</span>
          <span className="text-[#00C853]">Wall</span>
        </div>
      )}
    </div>
  );
};
