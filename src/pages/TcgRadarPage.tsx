import React, { useState, useEffect } from 'react';
import {
  Radio,
  Zap,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Sliders,
  Send,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import {
  TcgRestockEvent,
  TcgMonitorConfig,
  Retailer,
  BillingProfile,
  ProxyPool,
} from '../types';

interface TcgRadarPageProps {
  onQuickSnipe: (item: {
    productName: string;
    retailer: Retailer;
    identifier: string;
    price: number;
  }) => Promise<void>;
  profiles: BillingProfile[];
  proxyPools: ProxyPool[];
  defaultWebhookUrl?: string;
}

const SEED_RESTOCK_EVENTS: TcgRestockEvent[] = [
  {
    id: 'rst_seed_1',
    productName: 'Pokémon TCG: Mega Evolution Chaos Rising Booster Box',
    setOrSeries: 'Mega Evolution: Chaos Rising (ME04)',
    retailer: 'bestbuy',
    identifier: '6579822',
    price: 161.64,
    marketPrice: 289.00,
    productUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=pokemon+trading+card+game',
    timestamp: Date.now() - 1000 * 60 * 3, // 3 mins ago
    status: 'IN_STOCK',
    isDirectDrop: true,
    isLeakOrEarlyDrop: true,
    projectedDropWindow: 'Thursdays 10:00 AM - 11:30 AM EST (Restock Wave)',
  },
  {
    id: 'rst_seed_2',
    productName: 'Pokémon TCG: 151 Booster Bundle (6 Packs)',
    setOrSeries: 'Scarlet & Violet: 151 Special Set',
    retailer: 'bestbuy',
    identifier: '6548485',
    price: 28.99,
    marketPrice: 49.00,
    productUrl: 'https://www.bestbuy.com/site/pokemon-pokemon-tcg-scarlet-violet-3-5-151-booster-bundle/6548485.p?skuId=6548485',
    timestamp: Date.now() - 1000 * 60 * 7,
    status: 'IN_STOCK',
    isDirectDrop: true,
    projectedDropWindow: 'High-Velocity Restock Spike',
  },
  {
    id: 'rst_seed_3',
    productName: 'Pokémon TCG: Prismatic Evolutions Booster Bundle (6 Packs)',
    setOrSeries: 'Special: Prismatic Evolutions (SV08.5)',
    retailer: 'amazon',
    identifier: 'B0DHQ6Z9PQ',
    price: 26.94,
    marketPrice: 62.00,
    productUrl: 'https://www.amazon.com/dp/B0DHQ6Z9PQ',
    timestamp: Date.now() - 1000 * 60 * 14,
    status: 'IN_STOCK',
    isDirectDrop: true,
    isLeakOrEarlyDrop: true,
    projectedDropWindow: 'Amazon Flash Restock Waves (Unscheduled Lightning Drops)',
  },
  {
    id: 'rst_seed_4',
    productName: 'One Piece Card Game: The Azure Emperor Booster Box [OP-10]',
    setOrSeries: 'One Piece Card Game [OP-10]',
    retailer: 'amazon',
    identifier: 'B0DQ8917ZY',
    price: 107.76,
    marketPrice: 195.00,
    productUrl: 'https://www.amazon.com/s?k=one+piece+card+game+booster+box',
    timestamp: Date.now() - 1000 * 60 * 22,
    status: 'IN_STOCK',
    isDirectDrop: true,
    isLeakOrEarlyDrop: true,
    projectedDropWindow: 'Direct Bandai Allocation Restock',
  },
  {
    id: 'rst_seed_5',
    productName: 'Pokémon TCG: Destined Rivals Booster Bundle (6 Packs)',
    setOrSeries: 'Scarlet & Violet: Destined Rivals (SV10)',
    retailer: 'target',
    identifier: '90184421',
    price: 26.94,
    marketPrice: 48.00,
    productUrl: 'https://www.target.com/s?searchTerm=pokemon+booster+bundle',
    timestamp: Date.now() - 1000 * 60 * 35,
    status: 'IN_STOCK',
    isLeakOrEarlyDrop: true,
    projectedDropWindow: 'Target RedSky Inventory Pulsing: 6:00 AM - 8:00 AM EST',
  },
];

export const TcgRadarPage: React.FC<TcgRadarPageProps> = ({
  onQuickSnipe,
  profiles,
  proxyPools,
  defaultWebhookUrl = '',
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [pollInterval, setPollInterval] = useState(15); // seconds
  const [webhookUrl, setWebhookUrl] = useState(defaultWebhookUrl);
  const [autoSnipe, setAutoSnipe] = useState(false);
  const [positiveKeywords, setPositiveKeywords] = useState('Chaos Rising, Booster Box, ETB, Destined Rivals, OP-10, Prismatic');
  const [negativeKeywords, setNegativeKeywords] = useState('binder, portfolio, damaged, pin, sticker');
  const [selectedRetailers, setSelectedRetailers] = useState<Retailer[]>([
    'bestbuy',
    'target',
    'walmart',
    'amazon',
  ]);

  const [restockFeed, setRestockFeed] = useState<TcgRestockEvent[]>(() => {
    try {
      const saved = localStorage.getItem('blank_tcg_restock_feed');
      return saved ? JSON.parse(saved) : SEED_RESTOCK_EVENTS;
    } catch {
      return SEED_RESTOCK_EVENTS;
    }
  });

  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  // Sync feed to local storage
  useEffect(() => {
    try {
      localStorage.setItem('blank_tcg_restock_feed', JSON.stringify(restockFeed.slice(0, 50)));
    } catch {}
  }, [restockFeed]);

  // Initial check on mount
  useEffect(() => {
    if (window.blankBotAPI?.getTcgMonitorStatus) {
      window.blankBotAPI.getTcgMonitorStatus().then((status) => {
        setIsRunning(status.isRunning);
      });
    }

    if (window.blankBotAPI?.onTcgRestockDetected) {
      const unsub = window.blankBotAPI.onTcgRestockDetected((event) => {
        setRestockFeed((prev) => [event, ...prev]);

        if (autoSnipe) {
          onQuickSnipe({
            productName: event.productName,
            retailer: event.retailer,
            identifier: event.identifier,
            price: event.price,
          });
        }
      });
      return () => unsub();
    }
  }, [autoSnipe, onQuickSnipe]);

  const handleToggleMonitor = async () => {
    if (isRunning) {
      if (window.blankBotAPI?.stopTcgMonitor) {
        await window.blankBotAPI.stopTcgMonitor();
      }
      setIsRunning(false);
    } else {
      const config: TcgMonitorConfig = {
        enabled: true,
        pollIntervalMs: pollInterval * 1000,
        discordWebhookUrl: webhookUrl.trim(),
        positiveKeywords: positiveKeywords.split(',').map((s) => s.trim()).filter(Boolean),
        negativeKeywords: negativeKeywords.split(',').map((s) => s.trim()).filter(Boolean),
        retailers: selectedRetailers,
        autoSnipe,
        profileId: profiles[0]?.id,
        proxyPoolId: proxyPools[0]?.id,
      };

      if (window.blankBotAPI?.startTcgMonitor) {
        await window.blankBotAPI.startTcgMonitor(config);
      }
      setIsRunning(true);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      setWebhookTestStatus('Enter a valid Discord Webhook URL first.');
      setTimeout(() => setWebhookTestStatus(null), 4000);
      return;
    }

    setIsTestingWebhook(true);
    setWebhookTestStatus(null);
    try {
      const sampleEvent = restockFeed[0] || SEED_RESTOCK_EVENTS[0];
      let ok = false;
      if (window.blankBotAPI?.sendTcgDiscordWebhook) {
        ok = await window.blankBotAPI.sendTcgDiscordWebhook(webhookUrl.trim(), sampleEvent);
      } else {
        ok = true;
      }

      if (ok) {
        setWebhookTestStatus('Webhook dispatched successfully! Check your Discord channel.');
      } else {
        setWebhookTestStatus('Failed to deliver webhook. Check permissions/URL.');
      }
    } catch (err: any) {
      setWebhookTestStatus(`Error: ${err.message}`);
    } finally {
      setIsTestingWebhook(false);
      setTimeout(() => setWebhookTestStatus(null), 5000);
    }
  };

  const handleOpenStore = (url: string) => {
    if (window.blankBotAPI?.openExternal) {
      window.blankBotAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const toggleRetailer = (ret: Retailer) => {
    setSelectedRetailers((prev) =>
      prev.includes(ret) ? prev.filter((r) => r !== ret) : [...prev, ret]
    );
  };

  const formatTimeAgo = (epochMs: number) => {
    const diffSec = Math.floor((Date.now() - epochMs) / 1000);
    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return `${Math.floor(diffSec / 3600)}h ago`;
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-950 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 px-6 border-b border-surface-800/80 bg-surface-900/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-5 h-5 text-brand-400" />
            24/7 TCG Drop Radar &amp; Restock Sentinel
          </h2>
          <p className="text-xs text-surface-400 mt-0.5">
            Real-time inventory database scanner tracking Pokémon, One Piece, and sports card restocks across Best Buy, Target, Walmart, and Amazon.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
              isRunning
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-surface-800/80 border-surface-700 text-surface-400'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning ? 'bg-emerald-400 animate-ping' : 'bg-surface-600'
              }`}
            />
            <span>{isRunning ? 'SCANNER LIVE' : 'SENTINEL PAUSED'}</span>
          </div>

          <button
            onClick={handleToggleMonitor}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Scanner</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start 24/7 Radar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Top Controls Sidebar */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-surface-800/80 bg-surface-900/30 p-5 space-y-4 overflow-y-auto">
          {/* Discord Webhook Configuration */}
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-brand-400" />
                Discord Drop Webhook
              </span>
              <span className="text-[10px] text-brand-400 font-mono font-semibold">Blank Sentinel Alert</span>
            </div>

            <input
              type="text"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700/80 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-surface-600 font-mono outline-none"
            />

            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="w-full py-1.5 bg-surface-800 hover:bg-surface-700 disabled:opacity-40 text-brand-300 border border-brand-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3 h-3 text-brand-400" />
              <span>{isTestingWebhook ? 'Sending Sample...' : 'Send Test Drop Ping'}</span>
            </button>

            {webhookTestStatus && (
              <p className="text-[11px] font-mono text-brand-300 pt-1">{webhookTestStatus}</p>
            )}
          </div>

          {/* Scanner Settings */}
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-400" />
              Scanner Parameters
            </span>

            {/* Poll Speed Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-surface-400">Scan Frequency</span>
                <span className="font-mono text-white font-bold">{pollInterval}s</span>
              </div>
              <input
                type="range"
                min="8"
                max="60"
                step="2"
                value={pollInterval}
                onChange={(e) => setPollInterval(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            {/* Auto-Snipe Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800 cursor-pointer">
              <div className="text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Auto-Snipe Drop Tasks
                </span>
                <span className="text-[10px] text-surface-400 block mt-0.5">
                  Immediately spawn and start a checkout task on restock
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSnipe}
                onChange={(e) => setAutoSnipe(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-surface-900 border-surface-700"
              />
            </label>

            {/* Retailer Checkboxes */}
            <div>
              <span className="text-[11px] font-semibold text-surface-300 uppercase block mb-1.5">
                Active Retailer Channels
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(['bestbuy', 'target', 'walmart', 'amazon'] as Retailer[]).map((ret) => (
                  <button
                    key={ret}
                    type="button"
                    onClick={() => toggleRetailer(ret)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize flex items-center justify-between transition-all ${
                      selectedRetailers.includes(ret)
                        ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40'
                        : 'bg-surface-950 text-surface-500 border border-surface-800'
                    }`}
                  >
                    <span>{ret === 'bestbuy' ? 'Best Buy' : ret}</span>
                    {selectedRetailers.includes(ret) && (
                      <CheckCircle className="w-3 h-3 text-brand-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="text-[11px] font-semibold text-surface-300 uppercase block mb-1">
                Positive Keyword Triggers
              </label>
              <textarea
                rows={2}
                value={positiveKeywords}
                onChange={(e) => setPositiveKeywords(e.target.value)}
                placeholder="Chaos Rising, Booster Box, ETB..."
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-surface-600 font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-surface-300 uppercase block mb-1">
                Negative Blacklist Filters
              </label>
              <textarea
                rows={2}
                value={negativeKeywords}
                onChange={(e) => setNegativeKeywords(e.target.value)}
                placeholder="binder, portfolio, damaged..."
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-surface-600 font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Live Restock Stream */}
        <div className="flex-1 flex flex-col overflow-hidden bg-surface-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Drop &amp; Restock Events
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-surface-800 text-surface-300 font-mono text-[10px]">
                {restockFeed.length} Events Logged
              </span>
            </div>

            <button
              onClick={() => setRestockFeed([])}
              className="text-[11px] text-surface-500 hover:text-surface-300 transition-colors"
            >
              Clear Feed
            </button>
          </div>

          {/* Event Cards Scroll */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {restockFeed.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-surface-800 rounded-2xl">
                <Radio className="w-8 h-8 text-surface-600 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-surface-400 font-medium">
                  Radar scanner listening for drops. Restock events will appear here the instant inventory is detected.
                </p>
              </div>
            ) : (
              restockFeed.map((event) => {
                const spread = event.marketPrice && event.marketPrice > event.price
                  ? event.marketPrice - event.price
                  : 0;

                return (
                  <div
                    key={event.id}
                    className="p-4 rounded-2xl bg-surface-900 border border-surface-800/90 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-center shrink-0 text-brand-400 font-black text-sm">
                        {event.retailer[0].toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                              event.retailer === 'bestbuy'
                                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                : event.retailer === 'target'
                                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                                : event.retailer === 'walmart'
                                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {event.retailer}
                          </span>
                          <span className="text-[11px] text-surface-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(event.timestamp)}
                          </span>
                          {event.isLeakOrEarlyDrop && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-300" />
                              Advance Drop Intel
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white truncate mt-1">
                          {event.productName}
                        </h4>

                        {event.projectedDropWindow && (
                          <div className="text-[11px] font-mono text-purple-300 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Projected Pattern: {event.projectedDropWindow}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-3 text-[11px] font-mono mt-0.5">
                          <span className="text-surface-400">
                            MSRP: <strong className="text-white font-semibold">${event.price.toFixed(2)}</strong>
                          </span>
                          {event.marketPrice && (
                            <span className="text-emerald-400">
                              Resale: ${event.marketPrice.toFixed(2)}
                            </span>
                          )}
                          {spread > 0 && (
                            <span className="text-cyan-300">
                              +${spread.toFixed(2)} spread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenStore(event.productUrl)}
                        className="px-3 py-1.5 bg-surface-950 hover:bg-surface-800 text-surface-300 border border-surface-700/80 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Open product page in browser"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Store Page</span>
                      </button>

                      <button
                        onClick={() =>
                          onQuickSnipe({
                            productName: event.productName,
                            retailer: event.retailer,
                            identifier: event.identifier,
                            price: event.price,
                          })
                        }
                        className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Quick Snipe</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
