import React, { useState } from 'react';
import { X, Clock, Zap, Repeat, PlayCircle } from 'lucide-react';
import {
  Retailer,
  TaskItem,
  BillingProfile,
  ProxyPool,
  RetailAccount,
} from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<TaskItem>) => void;
  initialTask?: TaskItem | null;
  groupId: string;
  profiles: BillingProfile[];
  proxyPools: ProxyPool[];
  accounts: RetailAccount[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  groupId,
  profiles,
  proxyPools,
  accounts,
}) => {
  const [retailer, setRetailer] = useState<Retailer>(initialTask?.retailer || 'bestbuy');
  const [input, setInput] = useState<string>(initialTask?.input || '');
  const [monitorDelay, setMonitorDelay] = useState<number>(initialTask?.monitorDelay || 3500);
  const [retryDelay, setRetryDelay] = useState<number>(initialTask?.retryDelay || 2000);
  const [profileId, setProfileId] = useState<string>(initialTask?.profileId || profiles[0]?.id || '');
  const [proxyPoolId, setProxyPoolId] = useState<string>(initialTask?.proxyPoolId || proxyPools[0]?.id || '');
  const [accountId, setAccountId] = useState<string>(initialTask?.accountId || '');

  // Flags
  const [skipMonitor, setSkipMonitor] = useState<boolean>(initialTask?.flags?.skipMonitor || false);
  const [loopCheckout, setLoopCheckout] = useState<boolean>(initialTask?.flags?.loopCheckout || false);
  const [autoStartOnRestart, setAutoStartOnRestart] = useState<boolean>(initialTask?.flags?.autoStartOnRestart || false);

  // Epoch Scheduler
  const [useSchedule, setUseSchedule] = useState<boolean>(Boolean(initialTask?.scheduledStartEpoch));
  const [scheduleTime, setScheduleTime] = useState<string>(
    initialTask?.scheduledStartEpoch
      ? new Date(initialTask.scheduledStartEpoch).toISOString().slice(11, 16)
      : '10:00'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profileId) return;

    let scheduledStartEpoch: number | undefined;
    if (useSchedule) {
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(hours, minutes, 0, 0);
      if (targetDate.getTime() <= Date.now()) {
        targetDate.setDate(targetDate.getDate() + 1); // next day
      }
      scheduledStartEpoch = targetDate.getTime();
    }

    onSave({
      id: initialTask?.id,
      groupId,
      retailer,
      input: input.trim(),
      monitorDelay,
      retryDelay,
      profileId,
      proxyPoolId,
      accountId: accountId || undefined,
      flags: {
        skipMonitor,
        loopCheckout,
        autoStartOnRestart,
      },
      scheduledStartEpoch,
    });

    onClose();
  };

  const getRetailerInputHelp = () => {
    switch (retailer) {
      case 'bestbuy':
        return 'SKU (e.g. 6579999), Product URL, or comma-separated SKUs';
      case 'walmart':
        return 'Item ID (e.g. 54321098), Offer ID, or ItemID:OfferID';
      case 'target':
        return 'TCIN (e.g. 89765432), DPCI (087-02-1234), or Product URL';
      case 'amazon':
        return 'ASIN (e.g. B0DC87X1L9) or ASIN:OfferListingId';
      case 'apple':
        return 'Part Number (e.g. MU793LL/A) or Direct Apple URL';
      default:
        return 'Product SKU or URL';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-xl bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 px-6 border-b border-surface-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-wide">
            {initialTask ? 'Edit Task' : 'Create New Automation Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Retailer Selector */}
          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
              Target Retail Platform
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['bestbuy', 'walmart', 'target', 'amazon', 'apple'] as Retailer[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRetailer(r)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    retailer === r
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 border border-brand-400'
                      : 'bg-surface-950 text-surface-400 border border-surface-800 hover:border-surface-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Product Input */}
          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
              Monitor Input / Product Identifiers
            </label>
            <input
              type="text"
              required
              placeholder={getRetailerInputHelp()}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-surface-600 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Delays Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Monitor Delay (ms)
              </label>
              <input
                type="number"
                min="500"
                step="100"
                value={monitorDelay}
                onChange={(e) => setMonitorDelay(Number(e.target.value))}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Retry Delay (ms)
              </label>
              <input
                type="number"
                min="500"
                step="100"
                value={retryDelay}
                onChange={(e) => setRetryDelay(Number(e.target.value))}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Profile & Proxy Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Billing Profile
              </label>
              <select
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-brand-500 outline-none cursor-pointer"
              >
                {profiles.length === 0 ? (
                  <option value="" className="bg-surface-900 text-surface-400">No profiles created (Add in Profiles)</option>
                ) : (
                  profiles.map((p) => (
                    <option key={p.id} value={p.id} className="bg-surface-900 text-slate-100">
                      {p.profileName} ({p.payment.cardBrand.toUpperCase()} {p.payment.maskedPan})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Proxy Pool
              </label>
              <select
                value={proxyPoolId}
                onChange={(e) => setProxyPoolId(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
              >
                <option value="">Direct / Localhost</option>
                {proxyPools.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.proxies.length} proxies • {p.tier})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Automation Flags */}
          <div className="pt-2 border-t border-surface-800/80 space-y-2">
            <span className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
              High-Frequency Automation Flags
            </span>

            <label className="flex items-center space-x-3 p-2 rounded-lg bg-surface-950/60 border border-surface-800 cursor-pointer hover:border-surface-700">
              <input
                type="checkbox"
                checked={skipMonitor}
                onChange={(e) => setSkipMonitor(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-surface-900 border-surface-700"
              />
              <div className="text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Skip Monitoring (Direct Drop Mode)
                </span>
                <span className="text-[11px] text-surface-400 block">
                  Bypasses stock polling and fires checkout immediately for known drop times.
                </span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-2 rounded-lg bg-surface-950/60 border border-surface-800 cursor-pointer hover:border-surface-700">
              <input
                type="checkbox"
                checked={loopCheckout}
                onChange={(e) => setLoopCheckout(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-surface-900 border-surface-700"
              />
              <div className="text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                  Loop Checkouts
                </span>
                <span className="text-[11px] text-surface-400 block">
                  Automatically re-queues task upon order confirmation for uncapped drops.
                </span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-2 rounded-lg bg-surface-950/60 border border-surface-800 cursor-pointer hover:border-surface-700">
              <input
                type="checkbox"
                checked={autoStartOnRestart}
                onChange={(e) => setAutoStartOnRestart(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-surface-900 border-surface-700"
              />
              <div className="text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Auto-Start on App Restart
                </span>
                <span className="text-[11px] text-surface-400 block">
                  Automatically restores active worker execution if system restarts.
                </span>
              </div>
            </label>
          </div>

          {/* Epoch Scheduling */}
          <div className="pt-2 border-t border-surface-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-surface-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                Epoch Drop Scheduler
              </span>
              <input
                type="checkbox"
                checked={useSchedule}
                onChange={(e) => setUseSchedule(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500"
              />
            </div>

            {useSchedule && (
              <div className="flex items-center space-x-3 bg-surface-950 p-2.5 rounded-xl border border-surface-700">
                <span className="text-xs text-surface-400">Fire at exact time:</span>
                <input
                  type="time"
                  step="1"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-surface-900 border border-surface-700 rounded-lg px-2.5 py-1 text-xs font-mono text-brand-300 outline-none"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-surface-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
