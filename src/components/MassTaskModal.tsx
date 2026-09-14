import React, { useState } from 'react';
import { X, Layers, FileText, Zap } from 'lucide-react';
import {
  Retailer,
  BillingProfile,
  ProxyPool,
  RetailAccount,
  TaskItem,
} from '../types';

interface MassTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateTasks: (tasks: Partial<TaskItem>[]) => Promise<void>;
  profiles: BillingProfile[];
  proxyPools: ProxyPool[];
  accounts: RetailAccount[];
  defaultGroupId: string;
}

export const MassTaskModal: React.FC<MassTaskModalProps> = ({
  isOpen,
  onClose,
  onGenerateTasks,
  profiles,
  proxyPools,
  accounts,
  defaultGroupId,
}) => {
  const [activeTab, setActiveTab] = useState<'multiplier' | 'csv'>('multiplier');
  const [isGenerating, setIsGenerating] = useState(false);

  // Multiplier State
  const [skuListText, setSkuListText] = useState('');
  const [retailer, setRetailer] = useState<Retailer>('amazon');
  const [skipMonitor, setSkipMonitor] = useState(false);
  const [loopCheckout, setLoopCheckout] = useState(false);
  const [tasksPerSku, setTasksPerSku] = useState(1);
  const [profileSelection, setProfileSelection] = useState<string>('rotate');
  const [proxyPoolId, setProxyPoolId] = useState<string>(proxyPools[0]?.id || '');
  const [monitorDelay, setMonitorDelay] = useState(2500);
  const [retryDelay, setRetryDelay] = useState(1000);

  // CSV State
  const [csvText, setCsvText] = useState('');

  if (!isOpen) return null;

  const skus = skuListText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const calculatedTotalTasks = skus.length * Math.max(1, tasksPerSku);

  const handleMultiplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skus.length === 0) return;

    setIsGenerating(true);
    try {
      const generatedTasks: Partial<TaskItem>[] = [];

      skus.forEach((sku, skuIndex) => {
        for (let i = 0; i < tasksPerSku; i++) {
          let assignedProfileId = profileSelection;
          if (profileSelection === 'rotate' && profiles.length > 0) {
            const rotIndex = (skuIndex * tasksPerSku + i) % profiles.length;
            assignedProfileId = profiles[rotIndex].id;
          } else if (!assignedProfileId && profiles.length > 0) {
            assignedProfileId = profiles[0].id;
          }

          generatedTasks.push({
            groupId: defaultGroupId || 'default',
            retailer,
            flags: {
              skipMonitor,
              loopCheckout,
              autoStartOnRestart: false,
            },
            input: sku,
            profileId: assignedProfileId,
            proxyPoolId: proxyPoolId || undefined,
            monitorDelay,
            retryDelay,
            status: 'IDLE',
            statusMessage: 'Ready',
          });
        }
      });

      await onGenerateTasks(generatedTasks);
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCsvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = csvText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    setIsGenerating(true);
    try {
      const generatedTasks: Partial<TaskItem>[] = [];

      lines.forEach((line) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          const ret = (parts[0].toLowerCase() as Retailer) || retailer;
          const input = parts[1];
          const profId = parts[2] || (profiles[0]?.id ?? '');
          const proxId = parts[3] || proxyPoolId;
          const monDelay = parts[4] ? parseInt(parts[4], 10) : monitorDelay;
          const retDelay = parts[5] ? parseInt(parts[5], 10) : retryDelay;

          generatedTasks.push({
            groupId: defaultGroupId || 'default',
            retailer: ret,
            flags: {
              skipMonitor: false,
              loopCheckout: false,
              autoStartOnRestart: false,
            },
            input,
            profileId: profId,
            proxyPoolId: proxId || undefined,
            monitorDelay: isNaN(monDelay) ? 2500 : monDelay,
            retryDelay: isNaN(retDelay) ? 1000 : retDelay,
            status: 'IDLE',
            statusMessage: 'Ready',
          });
        }
      });

      await onGenerateTasks(generatedTasks);
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-900 border border-surface-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-surface-800 flex items-center justify-between bg-surface-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Mass Task Quick Import &amp; Multiplier
              </h2>
              <span className="text-[11px] text-surface-400">
                Batch generate dozens of tasks in seconds with automated profile rotation
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-surface-800 bg-surface-950/40 px-5">
          <button
            type="button"
            onClick={() => setActiveTab('multiplier')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'multiplier'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-surface-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>SKU List Multiplier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'csv'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-surface-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV / Quick String Import</span>
          </button>
        </div>

        {/* Body Form */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'multiplier' ? (
            <form onSubmit={handleMultiplierSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                  Target SKUs / ASINs (One per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="B0HFBMMSS6&#10;B0D1XD1ZV3&#10;B08FC5L3RG&#10;B09B8W5FW7"
                  value={skuListText}
                  onChange={(e) => setSkuListText(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 rounded-xl p-3 text-xs text-white font-mono placeholder:text-surface-600 focus:border-brand-500 outline-none"
                  required
                />
                <div className="flex items-center justify-between text-[11px] text-surface-400 mt-1 font-mono">
                  <span>Detected {skus.length} SKU(s)</span>
                  <span className="text-brand-400 font-bold">Total to create: {calculatedTotalTasks} task(s)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Retailer
                  </label>
                  <select
                    value={retailer}
                    onChange={(e) => setRetailer(e.target.value as Retailer)}
                    className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
                  >
                    <option value="amazon">Amazon US</option>
                    <option value="bestbuy">Best Buy US</option>
                    <option value="walmart">Walmart US</option>
                    <option value="target">Target</option>
                    <option value="apple">Apple US</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Tasks Per SKU
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={tasksPerSku}
                    onChange={(e) => setTasksPerSku(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Profile Allocation
                  </label>
                  <select
                    value={profileSelection}
                    onChange={(e) => setProfileSelection(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
                  >
                    <option value="rotate">⚡ Auto-Rotate All Profiles ({profiles.length} available)</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.profileName} ({p.shippingAddress.fullName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Proxy Pool
                  </label>
                  <select
                    value={proxyPoolId}
                    onChange={(e) => setProxyPoolId(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
                  >
                    <option value="">Direct / Local IP</option>
                    {proxyPools.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.proxies.length} proxies)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Monitor Delay (ms)
                  </label>
                  <input
                    type="number"
                    value={monitorDelay}
                    onChange={(e) => setMonitorDelay(parseInt(e.target.value, 10) || 2500)}
                    className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Retry Delay (ms)
                  </label>
                  <input
                    type="number"
                    value={retryDelay}
                    onChange={(e) => setRetryDelay(parseInt(e.target.value, 10) || 1000)}
                    className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 text-xs text-surface-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipMonitor}
                    onChange={(e) => setSkipMonitor(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 accent-brand-500"
                  />
                  <span>Skip Monitoring (Direct Cart)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-surface-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loopCheckout}
                    onChange={(e) => setLoopCheckout(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 accent-brand-500"
                  />
                  <span>Loop Checkout</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-surface-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-surface-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || skus.length === 0}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating...' : `Generate ${calculatedTotalTasks} Tasks`}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCsvSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                  Paste CSV Lines (retailer, input, profileId, proxyPoolId, monitorDelay, retryDelay)
                </label>
                <textarea
                  rows={6}
                  placeholder="amazon, B0HFBMMSS6, profile_1, pool_1, 2500, 1000&#10;bestbuy, 6579999, profile_2, pool_1, 1500, 800"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 rounded-xl p-3 text-xs text-white font-mono placeholder:text-surface-600 focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-surface-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-surface-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !csvText.trim()}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isGenerating ? 'Importing...' : 'Import CSV Tasks'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
