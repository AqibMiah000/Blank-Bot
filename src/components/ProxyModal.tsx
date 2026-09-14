import React, { useState } from 'react';
import { X, Server } from 'lucide-react';
import { ProxyPool, ProxyTier, ProxyProtocol } from '../types';

interface ProxyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pool: ProxyPool) => void;
  initialPool?: ProxyPool | null;
}

export const ProxyModal: React.FC<ProxyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPool,
}) => {
  const [name, setName] = useState(initialPool?.name || '');
  const [tier, setTier] = useState<ProxyTier>(initialPool?.tier || 'CHECKOUT_RESI');
  const [protocol, setProtocol] = useState<ProxyProtocol>('http');
  const [rawText, setRawText] = useState(
    initialPool?.proxies.map((p) => p.raw).join('\n') || ''
  );

  if (!isOpen) return null;

  const parseProxies = () => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines.map((line) => {
      const parts = line.split(':');
      let host = parts[0];
      let port = parseInt(parts[1], 10) || 80;
      let username = parts[2];
      let password = parts[3];

      return {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        raw: line,
        host,
        port,
        username,
        password,
        protocol,
        status: 'untested' as const,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rawText.trim()) return;

    const proxies = parseProxies();
    onSave({
      id: initialPool?.id || `pool_${Date.now()}`,
      name: name.trim(),
      tier,
      proxies,
      createdAt: initialPool?.createdAt || Date.now(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-lg bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="p-4 px-6 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              {initialPool ? 'Edit Proxy Pool' : 'Create New Proxy Pool'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
              Pool Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Target ISPs Drop #1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Tier Allocation
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as ProxyTier)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
              >
                <option value="MONITOR_ISP">Monitor ISP / Datacenter</option>
                <option value="CHECKOUT_RESI">Checkout Residential</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Default Protocol
              </label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as ProxyProtocol)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                Proxy List (One per line)
              </label>
              <span className="text-[11px] text-surface-500 font-mono">
                {rawText.split('\n').filter((l) => l.trim()).length} detected
              </span>
            </div>
            <textarea
              rows={7}
              required
              placeholder="ip:port:user:pass&#10;or ip:port"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl p-3 text-xs font-mono text-cyan-300 placeholder:text-surface-600 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20"
            >
              Save Proxy Pool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
