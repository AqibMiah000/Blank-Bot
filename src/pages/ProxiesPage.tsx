import React, { useState } from 'react';
import { Plus, Server, Play, Trash2, Edit2, Activity, Wifi, ShieldAlert } from 'lucide-react';
import { ProxyPool, ProxyItem } from '../types';
import { ProxyModal } from '../components/ProxyModal';

interface ProxiesPageProps {
  proxyPools: ProxyPool[];
  onSavePool: (pool: ProxyPool) => Promise<void>;
  onDeletePool: (poolId: string) => Promise<void>;
}

export const ProxiesPage: React.FC<ProxiesPageProps> = ({
  proxyPools,
  onSavePool,
  onDeletePool,
}) => {
  const [selectedPoolId, setSelectedPoolId] = useState<string>(proxyPools[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<ProxyPool | null>(null);
  const [targetEndpoint, setTargetEndpoint] = useState('https://www.bestbuy.com');
  const [isTesting, setIsTesting] = useState(false);

  const currentPool = proxyPools.find((p) => p.id === selectedPoolId) || proxyPools[0];

  const handleTestPool = async () => {
    if (!currentPool || isTesting) return;
    setIsTesting(true);

    try {
      if (window.blankBotAPI) {
        const updatedProxies = await window.blankBotAPI.testProxyPool(
          currentPool.id,
          currentPool.proxies,
          targetEndpoint
        );
        const updatedPool: ProxyPool = {
          ...currentPool,
          proxies: updatedProxies,
        };
        await onSavePool(updatedPool);
      } else {
        // Mock test simulation
        const simulated = currentPool.proxies.map((p) => ({
          ...p,
          latencyMs: Math.floor(60 + Math.random() * 250),
          status: (Math.random() > 0.08 ? 'active' : 'dead') as 'active' | 'dead',
        }));
        await onSavePool({ ...currentPool, proxies: simulated });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemoveDead = async () => {
    if (!currentPool) return;
    const clean = currentPool.proxies.filter((p) => p.status !== 'dead');
    await onSavePool({ ...currentPool, proxies: clean });
  };

  const getLatencyBadge = (proxy: ProxyItem) => {
    if (proxy.status === 'untested' || proxy.latencyMs === undefined) {
      return <span className="text-surface-500 font-mono text-[11px]">Untested</span>;
    }
    if (proxy.status === 'dead') {
      return <span className="text-rose-400 font-mono font-bold text-[11px]">DEAD</span>;
    }
    const ms = proxy.latencyMs;
    const color =
      ms < 150
        ? 'text-emerald-400'
        : ms < 400
        ? 'text-cyan-300'
        : ms < 800
        ? 'text-amber-400'
        : 'text-rose-400';

    return <span className={`font-mono font-bold text-[11px] ${color}`}>{ms}ms</span>;
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Pool Selector Left Bar */}
      <div className="w-64 bg-surface-950/90 border-r border-surface-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">
              Proxy Pools
            </span>
            <button
              onClick={() => {
                setEditingPool(null);
                setIsModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-cyan-400"
              title="Add Proxy Pool"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {proxyPools.map((pool) => {
              const isSelected = (currentPool?.id || '') === pool.id;
              const activeCount = pool.proxies.filter((p) => p.status === 'active').length;

              return (
                <div
                  key={pool.id}
                  onClick={() => setSelectedPoolId(pool.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-surface-900 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                      : 'bg-surface-950 border-surface-800/80 hover:border-surface-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate">{pool.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-400">
                      {pool.proxies.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold uppercase tracking-wider text-[10px] ${
                        pool.tier === 'MONITOR_ISP' ? 'text-amber-400' : 'text-cyan-400'
                      }`}
                    >
                      {pool.tier === 'MONITOR_ISP' ? 'Monitor ISP' : 'Checkout Resi'}
                    </span>
                    {activeCount > 0 && (
                      <span className="text-emerald-400 font-mono text-[10px]">
                        {activeCount} alive
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual-Tier Routing Guide */}
        <div className="bg-surface-900 p-3 rounded-xl border border-surface-800 text-[11px] text-surface-400 space-y-1.5">
          <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-brand-400" />
            Dual-Tier Routing
          </div>
          <p className="text-[10px] leading-relaxed">
            Fast ISP/Datacenter proxies assigned to stock monitor threads; pristine Residential
            proxies assigned to checkout settlement workers.
          </p>
        </div>
      </div>

      {/* Main Benchmarking Table Area */}
      <div className="flex-1 flex flex-col bg-surface-950 overflow-hidden">
        {currentPool ? (
          <>
            {/* Top Toolbar */}
            <div className="p-4 px-6 border-b border-surface-800 flex items-center justify-between bg-surface-900/40">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-surface-950 border border-surface-700 rounded-xl px-3 py-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-surface-400">Target:</span>
                  <select
                    value={targetEndpoint}
                    onChange={(e) => setTargetEndpoint(e.target.value)}
                    className="bg-surface-900 text-slate-100 text-xs font-semibold rounded-lg px-2 py-1 outline-none border border-surface-700 cursor-pointer"
                  >
                    <option value="https://www.bestbuy.com" className="bg-surface-900 text-slate-100 py-1">Best Buy US</option>
                    <option value="https://www.walmart.com" className="bg-surface-900 text-slate-100 py-1">Walmart US</option>
                    <option value="https://www.target.com" className="bg-surface-900 text-slate-100 py-1">Target</option>
                    <option value="https://www.amazon.com" className="bg-surface-900 text-slate-100 py-1">Amazon US</option>
                    <option value="https://www.apple.com" className="bg-surface-900 text-slate-100 py-1">Apple US</option>
                    <option value="https://www.google.com/generate_204" className="bg-surface-900 text-slate-100 py-1">Google Ping</option>
                  </select>
                </div>

                <button
                  onClick={handleTestPool}
                  disabled={isTesting}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isTesting ? 'Benchmarking...' : 'Test All Latencies'}</span>
                </button>

                <button
                  onClick={handleRemoveDead}
                  className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-rose-300 rounded-xl text-xs font-semibold"
                >
                  Remove Dead
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingPool(currentPool);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300"
                  title="Edit Pool"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeletePool(currentPool.id)}
                  className="p-1.5 rounded-lg bg-surface-800 hover:bg-rose-600/30 text-rose-400"
                  title="Delete Pool"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Proxies Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse text-xs font-mono-data">
                <thead>
                  <tr className="bg-surface-900/60 border-b border-surface-800 text-[11px] font-bold text-surface-400 uppercase tracking-wider sticky top-0 backdrop-blur z-10">
                    <th className="p-3 px-6">IP / Host</th>
                    <th className="p-3">Port</th>
                    <th className="p-3">Protocol</th>
                    <th className="p-3">Auth Credentials</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Latency (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-850">
                  {currentPool.proxies.map((proxy) => (
                    <tr key={proxy.id} className="hover:bg-surface-900/40">
                      <td className="p-3 px-6 text-slate-200">{proxy.host}</td>
                      <td className="p-3 text-surface-400">{proxy.port}</td>
                      <td className="p-3 uppercase text-[10px] text-brand-400 font-bold">
                        {proxy.protocol}
                      </td>
                      <td className="p-3 text-surface-500 truncate max-w-[150px]">
                        {proxy.username ? `${proxy.username}:••••••` : 'IP Whitelist'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            proxy.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : proxy.status === 'dead'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-surface-800 text-surface-400'
                          }`}
                        >
                          {proxy.status}
                        </span>
                      </td>
                      <td className="p-3">{getLatencyBadge(proxy)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-surface-500 space-y-2">
            <Server className="w-10 h-10 text-surface-700" />
            <p className="text-xs">No proxy pool selected.</p>
          </div>
        )}
      </div>

      {/* Proxy Modal */}
      <ProxyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPool(null);
        }}
        onSave={onSavePool}
        initialPool={editingPool}
      />
    </div>
  );
};
