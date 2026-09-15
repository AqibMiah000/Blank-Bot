import React from 'react';
import {
  Layers,
  CreditCard,
  Server,
  UserCheck,
  Gift,
  ShieldCheck,
  Settings,
  Cloud,
  Terminal,
  Activity,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';

export type PageId =
  | 'tasks'
  | 'checkouts'
  | 'profiles'
  | 'proxies'
  | 'accounts'
  | 'freebies'
  | 'analytics'
  | 'captchas'
  | 'settings'
  | 'auth';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  activeTasksCount: number;
  checkoutsCount?: number;
  enableFreebiesSniper?: boolean;
  enableMarketAnalytics?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  activeTasksCount,
  checkoutsCount,
  enableFreebiesSniper = true,
  enableMarketAnalytics = true,
}) => {
  const navItems = [
    { id: 'tasks' as PageId, label: 'Tasks', icon: Layers, badge: activeTasksCount || undefined },
    { id: 'checkouts' as PageId, label: 'Checkouts', icon: ShoppingBag, badge: checkoutsCount || undefined },
    { id: 'profiles' as PageId, label: 'Profiles', icon: CreditCard },
    { id: 'proxies' as PageId, label: 'Proxies', icon: Server },
    { id: 'accounts' as PageId, label: 'Accounts', icon: UserCheck },
    ...(enableFreebiesSniper
      ? [{ id: 'freebies' as PageId, label: 'Freebies Sniper', icon: Gift, highlight: true }]
      : []),
    ...(enableMarketAnalytics
      ? [{ id: 'analytics' as PageId, label: 'Market Analytics', icon: TrendingUp, highlight: true }]
      : []),
    { id: 'captchas' as PageId, label: 'Captchas', icon: ShieldCheck },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings },
    { id: 'auth' as PageId, label: 'Cloud Sync', icon: Cloud },
  ];

  return (
    <aside className="w-60 bg-surface-900 flex flex-col justify-between shrink-0">
      {/* Brand Header */}
      <div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-surface-950 font-black text-sm tracking-wider shadow-md shadow-brand-500/20">
              B
            </div>
            <div>
              <div className="text-sm font-black tracking-widest text-white">
                BLANK
              </div>
              <div className="text-[10px] text-surface-400 font-mono tracking-tight">
                v1.20.0 • HIGH-FREQUENCY
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 font-semibold'
                    : 'text-surface-400 hover:text-slate-200 hover:bg-surface-850'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-400' : 'text-surface-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-400 animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-3 text-xs">
        <div className="bg-surface-950/80 rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-surface-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Runtime Shell
            </span>
            <span className="font-mono text-emerald-400 font-semibold">Active</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-surface-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              JA4 TLS Fingerprint
            </span>
            <span className="font-mono text-cyan-300 text-[10px]">Spoofed</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
