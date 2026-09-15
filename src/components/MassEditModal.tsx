import React, { useState } from 'react';
import { X, Sliders, ShieldCheck, Zap, Repeat, PlayCircle, Layers } from 'lucide-react';
import { BillingProfile, ProxyPool, Retailer } from '../types';

export interface MassEditUpdates {
  retailer?: Retailer;
  monitorDelay?: number;
  retryDelay?: number;
  profileId?: string;
  proxyPoolId?: string;
  flags?: {
    skipMonitor?: boolean;
    loopCheckout?: boolean;
    autoStartOnRestart?: boolean;
    dryRun?: boolean;
  };
}

interface MassEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (updates: MassEditUpdates) => Promise<void>;
  selectedCount: number;
  profiles: BillingProfile[];
  proxyPools: ProxyPool[];
}

export const MassEditModal: React.FC<MassEditModalProps> = ({
  isOpen,
  onClose,
  onApply,
  selectedCount,
  profiles,
  proxyPools,
}) => {
  // Field-enable toggles
  const [updateRetailer, setUpdateRetailer] = useState(false);
  const [retailer, setRetailer] = useState<Retailer>('bestbuy');

  const [updateMonitorDelay, setUpdateMonitorDelay] = useState(false);
  const [monitorDelay, setMonitorDelay] = useState<number>(3500);

  const [updateRetryDelay, setUpdateRetryDelay] = useState(false);
  const [retryDelay, setRetryDelay] = useState<number>(2000);

  const [updateProfile, setUpdateProfile] = useState(false);
  const [profileId, setProfileId] = useState<string>(profiles[0]?.id || '');

  const [updateProxyPool, setUpdateProxyPool] = useState(false);
  const [proxyPoolId, setProxyPoolId] = useState<string>('');

  const [updateFlags, setUpdateFlags] = useState(false);
  const [skipMonitor, setSkipMonitor] = useState(false);
  const [loopCheckout, setLoopCheckout] = useState(false);
  const [autoStartOnRestart, setAutoStartOnRestart] = useState(false);
  const [dryRun, setDryRun] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updates: MassEditUpdates = {};
      if (updateRetailer) updates.retailer = retailer;
      if (updateMonitorDelay) updates.monitorDelay = monitorDelay;
      if (updateRetryDelay) updates.retryDelay = retryDelay;
      if (updateProfile) updates.profileId = profileId;
      if (updateProxyPool) updates.proxyPoolId = proxyPoolId;
      if (updateFlags) {
        updates.flags = {
          skipMonitor,
          loopCheckout,
          autoStartOnRestart,
          dryRun,
        };
      }

      await onApply(updates);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-lg bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 px-6 border-b border-surface-800 flex items-center justify-between bg-surface-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Mass Edit Tasks
                <span className="px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 font-mono text-[10px]">
                  {selectedCount} Selected
                </span>
              </h3>
              <p className="text-[11px] text-surface-400">
                Check any property you wish to batch update across selected tasks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Update Retailer */}
          <div className="p-3 bg-surface-950/60 border border-surface-800/80 rounded-xl space-y-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-surface-300 cursor-pointer">
              <input
                type="checkbox"
                checked={updateRetailer}
                onChange={(e) => setUpdateRetailer(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-surface-900 border-surface-700"
              />
              <span>Change Retailer</span>
            </label>
            {updateRetailer && (
              <select
                value={retailer}
                onChange={(e) => setRetailer(e.target.value as Retailer)}
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="bestbuy">Best Buy</option>
                <option value="walmart">Walmart</option>
                <option value="target">Target</option>
                <option value="amazon">Amazon</option>
                <option value="apple">Apple</option>
              </select>
            )}
          </div>

          {/* Delays Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-surface-950/60 border border-surface-800/80 rounded-xl space-y-2">
              <label className="flex items-center space-x-2 text-xs font-semibold text-surface-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateMonitorDelay}
                  onChange={(e) => setUpdateMonitorDelay(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 bg-surface-900 border-surface-700"
                />
                <span>Monitor Delay (ms)</span>
              </label>
              {updateMonitorDelay && (
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={monitorDelay}
                  onChange={(e) => setMonitorDelay(Number(e.target.value))}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
                />
              )}
            </div>

            <div className="p-3 bg-surface-950/60 border border-surface-800/80 rounded-xl space-y-2">
              <label className="flex items-center space-x-2 text-xs font-semibold text-surface-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateRetryDelay}
                  onChange={(e) => setUpdateRetryDelay(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 bg-surface-900 border-surface-700"
                />
                <span>Retry Delay (ms)</span>
              </label>
              {updateRetryDelay && (
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={retryDelay}
                  onChange={(e) => setRetryDelay(Number(e.target.value))}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
                />
              )}
            </div>
          </div>

          {/* Profile & Proxy Reassignment */}
          <div className="p-3 bg-surface-950/60 border border-surface-800/80 rounded-xl space-y-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-surface-300 cursor-pointer">
              <input
                type="checkbox"
                checked={updateProfile}
                onChange={(e) => setUpdateProfile(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-surface-900 border-surface-700"
              />
              <span>Reassign Billing Profile</span>
            </label>
            {updateProfile && (
              <select
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profileName} ({p.payment.cardBrand.toUpperCase()} {p.payment.maskedPan})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="p-3 bg-surface-950/60 border border-surface-800/80 rounded-xl space-y-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-surface-300 cursor-pointer">
              <input
                type="checkbox"
                checked={updateProxyPool}
                onChange={(e) => setUpdateProxyPool(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-surface-900 border-surface-700"
              />
              <span>Reassign Proxy Pool</span>
            </label>
            {updateProxyPool && (
              <select
                value={proxyPoolId}
                onChange={(e) => setProxyPoolId(e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="">Direct / Localhost (No Proxies)</option>
                {proxyPools.map((pool) => (
                  <option key={pool.id} value={pool.id}>
                    {pool.name} ({pool.proxies.length} proxies • {pool.tier})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Automation Flags */}
          <div className="p-3 bg-surface-950/60 border border-surface-800/80 rounded-xl space-y-3">
            <label className="flex items-center space-x-2 text-xs font-semibold text-surface-300 cursor-pointer">
              <input
                type="checkbox"
                checked={updateFlags}
                onChange={(e) => setUpdateFlags(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-surface-900 border-surface-700"
              />
              <span>Batch Update Automation Flags</span>
            </label>

            {updateFlags && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-800/60">
                <label className="flex items-center space-x-2 p-2 rounded-lg bg-surface-900 border border-surface-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipMonitor}
                    onChange={(e) => setSkipMonitor(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-brand-500"
                  />
                  <span className="text-[11px] text-white flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Skip Monitor
                  </span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-lg bg-surface-900 border border-surface-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loopCheckout}
                    onChange={(e) => setLoopCheckout(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-cyan-500"
                  />
                  <span className="text-[11px] text-white flex items-center gap-1">
                    <Repeat className="w-3 h-3 text-cyan-400" /> Loop Checkout
                  </span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-lg bg-surface-900 border border-surface-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoStartOnRestart}
                    onChange={(e) => setAutoStartOnRestart(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-500"
                  />
                  <span className="text-[11px] text-white flex items-center gap-1">
                    <PlayCircle className="w-3 h-3 text-emerald-400" /> Auto-Restart
                  </span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-lg bg-surface-900 border border-surface-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-500"
                  />
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" /> Dry-Run Mode
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-surface-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-surface-400 hover:text-white rounded-xl hover:bg-surface-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (!updateRetailer &&
                  !updateMonitorDelay &&
                  !updateRetryDelay &&
                  !updateProfile &&
                  !updateProxyPool &&
                  !updateFlags)
              }
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
            >
              {isSubmitting ? 'Applying...' : `Apply to ${selectedCount} Tasks`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
