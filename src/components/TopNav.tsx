import React from 'react';
import { ShieldCheck, ShieldAlert, History, BookOpen, Menu, PhoneOff } from 'lucide-react';
import { CallShieldLogo } from './CallShieldLogo';

interface TopNavProps {
  onTriggerKillSwitch: () => void;
  onOpenThreatLogs: () => void;
  onOpenResources: () => void;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL';
  isStreaming: boolean;
  threatLogsCount: number;
  onOpenMobileMenu: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onTriggerKillSwitch,
  onOpenThreatLogs,
  onOpenResources,
  threatLevel,
  isStreaming,
  threatLogsCount,
  onOpenMobileMenu,
}) => {
  return (
    <header className="h-14 sm:h-16 px-4 sm:px-6 border-b border-white/[0.08] bg-[#000000]/80 backdrop-blur-2xl flex items-center justify-between gap-3 shrink-0 select-none">
      {/* Brand & Mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 active:scale-95 transition-all"
          title="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <CallShieldLogo className="w-7 h-7 sm:w-8 sm:h-8" iconClassName="w-4 h-4" />
          <div>
            <span className="text-sm font-semibold tracking-tight text-white font-sans">
              Call Shield
            </span>
            <span className="hidden sm:inline-block text-[10px] text-neutral-400 ml-2 font-mono">
              AI Call Security
            </span>
          </div>
        </div>
      </div>

      {/* Center Apple-grade Protection Status Pill */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs">
        <span
          className={`w-2 h-2 rounded-full ${
            isStreaming
              ? threatLevel === 'CRITICAL'
                ? 'bg-red-500 animate-ping'
                : 'bg-[#FF3B30] animate-pulse'
              : 'bg-emerald-500'
          }`}
        />
        <span className="text-[11px] text-neutral-200 font-medium">
          {isStreaming
            ? threatLevel === 'CRITICAL'
              ? 'Threat Detected'
              : 'Screening Call...'
            : 'Protection Active'}
        </span>
      </div>

      {/* Right Actions: Threat Logs, Guide, and Emergency Action */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Threat Audit Log */}
        <button
          onClick={onOpenThreatLogs}
          className="relative p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          title="View Threat History"
        >
          <History className="w-3.5 h-3.5 text-neutral-300" />
          <span className="hidden md:inline">History</span>
          {threatLogsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#FF3B30] text-white text-[9px] font-bold">
              {threatLogsCount}
            </span>
          )}
        </button>

        {/* Resources / Safety Guide */}
        <button
          onClick={onOpenResources}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          title="Scam Safety Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-neutral-300" />
          <span className="hidden md:inline">Safety Guide</span>
        </button>

        {/* Emergency Cut Call Button (only shown when streaming or urgent) */}
        {isStreaming ? (
          <button
            onClick={onTriggerKillSwitch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF3B30] hover:bg-[#e03126] text-white text-xs font-bold transition-all shadow-md shadow-[#FF3B30]/30 active:scale-95"
            title="Emergency Disconnect"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cut Call</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};
