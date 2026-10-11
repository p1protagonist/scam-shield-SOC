import React from 'react';
import {
  LayoutDashboard,
  Radio,
  History,
  BookOpen,
  X,
  ShieldAlert,
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
      {/* Brand & Action Section */}
      <div>
        <div className="flex items-center justify-between pb-4 pt-1 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#FF4500] to-orange-500 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-lg shadow-[#FF4500]/25">
              CF
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                CY <span className="text-[#FF4500]">&middot;</span> FOCUS
              </h1>
              <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase block">
                SCAM SOC INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-full bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button (#FF4500) */}
        <div className="mb-4 mt-1">
          <button
            onClick={() => {
              onNewScan();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FF4500] hover:bg-[#e03d00] active:scale-[0.98] text-white font-medium text-xs transition-all duration-150 shadow-lg shadow-[#FF4500]/25"
          >
            <div className="flex items-center gap-2">
              <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-pulse' : ''}`} />
              <span className="font-semibold tracking-wide">
                {isStreaming ? (isMicActive ? 'Mic Streaming' : 'Analyzing Call') : 'Quick Test Scan'}
              </span>
            </div>
            <span className="text-white/80 font-mono text-[10px] font-bold">&rarr;</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <button
            onClick={() => {
              setActiveView('dashboard');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
              activeView === 'dashboard'
                ? 'bg-white/[0.1] text-white font-semibold border border-white/10 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-neutral-400" />
              <span>Live Monitor</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          <button
            onClick={() => {
              setActiveView('logs');
              onOpenThreatLogs();
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
              activeView === 'logs'
                ? 'bg-white/[0.1] text-white font-semibold border border-white/10 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-neutral-400" />
              <span>Threat Audit Logs</span>
            </div>
            {threatLogsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#FF4500]/20 text-[#FF4500] text-[10px] font-mono font-bold">
                {threatLogsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveView('resources');
              onOpenResources();
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
              activeView === 'resources'
                ? 'bg-white/[0.1] text-white font-semibold border border-white/10 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Knowledge Base</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">FTC / CISA</span>
          </button>
        </nav>
      </div>

      {/* Clean Bottom Profile Card */}
      <div className="pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              SC
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-neutral-200">Security Analyst</div>
              <div className="text-[10px] font-mono text-neutral-500">Live SOC Client</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 h-full bg-[#0E0E12]/80 border-r border-white/[0.08] backdrop-blur-3xl shrink-0 flex-col">
        {content}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop blur */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
          />

          {/* Drawer content */}
          <aside className="relative w-72 max-w-[80vw] h-full bg-[#0E0E12]/95 border-r border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col z-10 animate-fadeIn">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
