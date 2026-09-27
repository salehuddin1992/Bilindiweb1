import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const DEFAULT_BILINDI_LOGO = './ic_logo_bilindi.jpg';

interface BilindiLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  customLogoUrl?: string;
}

export const BilindiLogo: React.FC<BilindiLogoProps> = ({
  size = 40,
  showWordmark = false,
  className = '',
  customLogoUrl,
}) => {
  const { appLogoUrl } = useApp();
  const [hasError, setHasError] = useState(false);

  // Gunakan logo database/custom jika tersedia, jika gagal muat gunakan fallback lokal
  const currentLogo: string = (!hasError && (customLogoUrl || appLogoUrl))
    ? (customLogoUrl || appLogoUrl || DEFAULT_BILINDI_LOGO)
    : DEFAULT_BILINDI_LOGO;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="rounded-xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center bg-white dark:bg-[#242526] border border-slate-100 dark:border-[#3e4042]"
      >
        <img
          src={currentLogo}
          alt="BilindiWall Logo"
          className="w-full h-full object-contain p-0.5 block"
          loading="eager"
          decoding="async"
          onError={() => setHasError(true)}
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
