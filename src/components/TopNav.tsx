import React from 'react';
import { ShieldAlert, BookOpen, History, Menu } from 'lucide-react';

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
    <header className="h-16 px-4 sm:px-6 border-b border-white/[0.08] bg-[#0E0E12]/80 backdrop-blur-2xl flex items-center justify-between gap-3 shrink-0 select-none">
      {/* Brand title with Apple design cleanliness & mobile toggle */}
      <div className="flex items-center gap-2.5">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 active:scale-95 transition-all"
          title="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="w-7 h-7 rounded-2xl bg-gradient-to-tr from-[#FF4500] to-amber-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-[#FF4500]/20 shrink-0">
          S
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1 font-sans">
            ScamShield <span className="text-[#FF4500]">SOC</span>
          </span>
          <span className="hidden md:inline-block text-[10px] text-neutral-400 font-mono ml-2 uppercase tracking-wider">
            Real-Time Call Analyzer
          </span>
        </div>

        {/* Real Live Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 ml-3 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isStreaming
                ? threatLevel === 'CRITICAL'
                  ? 'bg-red-500 animate-ping'
                  : 'bg-[#FF4500] animate-pulse'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-[11px] font-mono text-neutral-300">
            {isStreaming ? (threatLevel === 'CRITICAL' ? 'SCAM DETECTED' : 'STREAM INTERCEPT ACTIVE') : 'SYSTEM ARMED & READY'}
          </span>
        </div>
      </div>

      {/* Right Controls: Responsive pills */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Threat Logs Button */}
        <button
          onClick={onOpenThreatLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 hover:text-white border border-white/10 text-xs font-mono transition-all duration-150 active:scale-95"
        >
          <History className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Threat Logs</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#FF4500]/25 text-[#FF4500] text-[10px] font-bold">
            {threatLogsCount}
          </span>
        </button>

        {/* Resources & Learn More Button */}
        <button
          onClick={onOpenResources}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 hover:text-white border border-white/10 text-xs transition-all duration-150 active:scale-95"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Learn More</span>
        </button>

        {/* Emergency Manual Kill Switch Trigger Button */}
        <button
          onClick={onTriggerKillSwitch}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600/25 hover:bg-red-600/40 text-red-300 hover:text-red-200 border border-red-500/40 text-xs font-mono font-semibold transition-all duration-150 active:scale-95 shadow-sm shadow-red-500/20"
          title="Manually trigger emergency call termination"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="hidden sm:inline">ARM KILL SWITCH</span>
          <span className="sm:hidden text-[10px]">KILL</span>
        </button>
      </div>
    </header>
  );
};
