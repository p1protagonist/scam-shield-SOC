import React from 'react';
import {
  ShieldCheck,
  History,
  BookOpen,
  X,
  Radio,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onNewScan: () => void;
  isStreaming: boolean;
  isMicActive: boolean;
  threatLogsCount: number;
  onOpenThreatLogs: () => void;
  onOpenResources: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onNewScan,
  isStreaming,
  isMicActive,
  threatLogsCount,
  onOpenThreatLogs,
  onOpenResources,
  isMobileOpen,
  onCloseMobile,
}) => {
  const content = (
    <div className="flex flex-col justify-between h-full select-none p-4">
      {/* Top Brand & Navigation */}
      <div>
        <div className="flex items-center justify-between pb-5 pt-1 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF3B30] to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#FF3B30]/25">
              S
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white font-sans">
                ScamShield
              </h1>
              <span className="text-[10px] text-neutral-400 font-mono tracking-wide">
                CALL PROTECTION
              </span>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-full bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="mb-4">
          <button
            onClick={() => {
              onNewScan();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/[0.1] hover:bg-white/[0.18] active:scale-[0.98] text-white font-medium text-xs transition-all border border-white/10"
          >
            <div className="flex items-center gap-2">
              <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'text-[#FF3B30] animate-pulse' : 'text-neutral-300'}`} />
              <span>
                {isStreaming ? (isMicActive ? 'Mic Screening Active' : 'Test Call Running') : 'Run Quick Test Call'}
              </span>
            </div>
            <span className="text-neutral-400 text-xs">&rarr;</span>
          </button>
        </div>

        {/* Minimal Navigation Items */}
        <nav className="space-y-1">
          <button
            onClick={() => {
              setActiveView('dashboard');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
              activeView === 'dashboard'
                ? 'bg-white/[0.1] text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-300" />
              <span>Call Protection</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          <button
            onClick={() => {
              onOpenThreatLogs();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-neutral-400" />
              <span>Threat History</span>
            </div>
            {threatLogsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                {threatLogsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onOpenResources();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-neutral-400" />
              <span>Safety Guide</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Clean Bottom Card: Status info */}
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
        <div className="flex items-center gap-2 text-neutral-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Real-Time Engine</span>
        </div>
        <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
          Screening calls for deepfake AI voice clones and coercive fraud.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Apple Sidebar */}
      <aside className="hidden lg:flex w-64 h-full border-r border-white/[0.08] bg-[#000000]/70 backdrop-blur-2xl flex-col shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[999] flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-[#000000]/95 backdrop-blur-2xl border-r border-white/10 z-10 animate-slideRight">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
