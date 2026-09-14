import React from 'react';
import { Play, Square, Mail, Shield, Bell } from 'lucide-react';
import { SystemStats } from '../types';

interface HeaderProps {
  title: string;
  stats: SystemStats;
  onMassStart: () => void;
  onMassStop: () => void;
  onToggle2FADrawer: () => void;
  pending2FACount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  stats,
  onMassStart,
  onMassStop,
  onToggle2FADrawer,
  pending2FACount,
}) => {
  return (
    <header className="h-13 bg-surface-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">{title}</h1>
      </div>

      {/* Global Quick Metrics & Controls */}
      <div className="flex items-center space-x-4">
        {/* Metric Badges */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-surface-850 flex items-center gap-1.5">
            <span className="text-surface-400">Tasks:</span>
            <span className="text-emerald-400 font-bold">{stats.activeTasks}</span>
            <span className="text-surface-500">/</span>
            <span className="text-slate-300">{stats.totalTasks}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-surface-850 flex items-center gap-1.5">
            <span className="text-surface-400">Proxies:</span>
            <span className="text-cyan-400 font-bold">{stats.activeProxies}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-surface-850 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-surface-400" />
            <span className="text-surface-400">IMAP:</span>
            <span
              className={`font-semibold ${
                stats.imapStatus === 'connected'
                  ? 'text-emerald-400'
                  : stats.imapStatus === 'connecting'
                  ? 'text-amber-400 animate-pulse'
                  : 'text-surface-500'
              }`}
            >
              {stats.imapStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 2FA Manual Drawer Trigger */}
        <button
          onClick={onToggle2FADrawer}
          className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            pending2FACount > 0
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 animate-pulse'
              : 'bg-surface-850 hover:bg-surface-800 text-surface-300'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>2FA Drawer</span>
          {pending2FACount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-slate-950 text-amber-400 text-[10px] font-mono rounded-full font-bold">
              {pending2FACount}
            </span>
          )}
        </button>

        {/* Mass Task Controls */}
        <div className="flex items-center space-x-1.5 pl-2">
          <button
            onClick={onMassStart}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start All</span>
          </button>
          <button
            onClick={onMassStop}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>Stop All</span>
          </button>
        </div>
      </div>
    </header>
  );
};
