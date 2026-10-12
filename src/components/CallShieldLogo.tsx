import React from 'react';
import { Shield, Phone } from 'lucide-react';

interface CallShieldLogoProps {
  className?: string;
  iconClassName?: string;
}

export const CallShieldLogo: React.FC<CallShieldLogoProps> = ({
  className = 'w-8 h-8',
  iconClassName = 'w-4 h-4',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-950 border border-white/[0.16] shadow-sm shadow-black/50 select-none ${className}`}
    >
      {/* Apple-style top specular highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* Minimalist shield with centered phone receiver */}
      <div className="relative flex items-center justify-center">
        <Shield className={`${iconClassName} text-white/90 stroke-[1.8]`} />
        <Phone className="w-2 h-2 text-[#30D158] absolute stroke-[2.4]" />
      </div>
    </div>
  );
};
