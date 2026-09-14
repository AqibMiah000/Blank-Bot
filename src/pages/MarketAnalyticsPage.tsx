import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Filter,
  Search,
  Flame,
  Plus,
  ArrowUpRight,
  ChevronDown,
  CheckSquare,
  Square,
  Copy,
  Check,
  Trash2,
  X,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MarketItem, MarketCategory, Retailer } from '../types';
import {
  getMarketAnalytics,
  MarketMetricsSummary,
  saveCustomMarketItem,
  deleteCustomMarketItem,
} from '../utils/market-analytics';

interface MarketAnalyticsPageProps {
  onCreateTaskWithItem?: (item: {
    retailer: Retailer;
    identifier: string;
    name: string;
    msrp?: number;
    marketPrice?: number;
  }) => void;
}

const CATEGORY_LABELS: Record<MarketCategory, string> = {
  pokemon: 'Pokémon TCG',
  onepiece: 'One Piece Card Game',
  sports: 'Sports Cards',
  gaming: 'PC Hardware & GPUs',
  consoles: 'Consoles & Handhelds',
};

const RETAILER_CONFIG: Record<
  Retailer,
  { label: string; text: string; bg: string; border: string }
> = {
  amazon: {
    label: 'Amazon',
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  bestbuy: {
    label: 'Best Buy',
    text: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
  },
  target: {
    label: 'Target',
    text: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
  },
  walmart: {
    label: 'Walmart',
    text: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
  apple: {
    label: 'Apple',
    text: 'text-slate-300',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
  },
};

export const MarketAnalyticsPage: React.FC<MarketAnalyticsPageProps> = ({
  onCreateTaskWithItem,
}) => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [metrics, setMetrics] = useState<MarketMetricsSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<MarketCategory[]>([
    'pokemon',
    'onepiece',
    'sports',
    'gaming',
    'consoles',
  ]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'profit' | 'roi' | 'price_high' | 'price_low'>('roi');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customRetailer, setCustomRetailer] = useState<Retailer>('amazon');
  const [customIdentifier, setCustomIdentifier] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<MarketCategory>('pokemon');
  const [customSeries, setCustomSeries] = useState('');
  const [customMsrp, setCustomMsrp] = useState<number | ''>('');
  const [customMarketPrice, setCustomMarketPrice] = useState<number | ''>('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = (force = false) => {
    if (force) setIsRefreshing(true);
    try {
      const data = getMarketAnalytics(force);
      setItems(data.items);
      setMetrics(data.metrics);
      setLastRefreshedAt(Date.now());
    } finally {
      if (force) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const handleToggleCategory = (cat: MarketCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return;
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(['pokemon', 'onepiece', 'sports', 'gaming', 'consoles']);
  };

  const handleCopyIdentifier = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdentifier.trim()) return;

    saveCustomMarketItem({
      retailer: customRetailer,
      identifier: customIdentifier.trim(),
      name: customName.trim() || `Target ${customIdentifier.trim()}`,
      category: customCategory,
      setOrSeries: customSeries.trim() || 'Custom Added',
      msrp: Number(customMsrp) || 0,
      marketPrice: Number(customMarketPrice) || Number(customMsrp) || 0,
      demand: 'high',
    });

    setCustomIdentifier('');
    setCustomName('');
    setCustomSeries('');
    setCustomMsrp('');
    setCustomMarketPrice('');
    setIsAddModalOpen(false);
    loadData(false);
  };

  const handleDeleteCustomItem = (id: string) => {
    deleteCustomMarketItem(id);
    loadData(false);
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => selectedCategories.includes(item.category))
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.setOrSeries.toLowerCase().includes(q) ||
          item.identifier.toLowerCase().includes(q) ||
          item.retailer.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const profitA = a.marketPrice - a.msrp;
        const profitB = b.marketPrice - b.msrp;
        const roiA = a.msrp > 0 ? (profitA / a.msrp) * 100 : (a.marketPrice > 0 ? 100 : 0);
        const roiB = b.msrp > 0 ? (profitB / b.msrp) * 100 : (b.marketPrice > 0 ? 100 : 0);

        if (sortBy === 'profit') return profitB - profitA;
        if (sortBy === 'roi') return roiB - roiA;
        if (sortBy === 'price_high') return b.marketPrice - a.marketPrice;
        if (sortBy === 'price_low') return a.marketPrice - b.marketPrice;
        return 0;
      });
  }, [items, selectedCategories, searchQuery, sortBy]);

  const timeAgoString = useMemo(() => {
    const diffSec = Math.max(1, Math.round((Date.now() - lastRefreshedAt) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    return `${Math.floor(diffSec / 60)}m ago`;
  }, [lastRefreshedAt, isRefreshing]);

  return (
    <div className="flex-1 flex flex-col bg-surface-950 overflow-y-auto p-5 md:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-surface-850/60">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Live Market &amp; TCG Intelligence</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold tracking-wide">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-surface-400 mt-1">
            Real-time secondary market valuations, MSRP profit margins, volume velocity, and 1-click drop dispatch.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Add Custom SKU Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-3.5 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            title="Track any custom SKU or ASIN"
          >
            <Plus className="w-4 h-4 text-brand-400" />
            <span>Track Custom SKU</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="h-9 px-3.5 bg-surface-900 hover:bg-surface-850 border border-surface-800 text-surface-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-all shadow-sm group"
            title="Force refresh live quotes"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${
                isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
              }`}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            <span className="text-[11px] text-surface-500 font-mono">({timeAgoString})</span>
          </button>

          {/* Category Dropdown Multi-Select */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="h-9 px-3.5 bg-surface-900 hover:bg-surface-850 border border-surface-800 text-surface-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
            >
              <Filter className="w-3.5 h-3.5 text-surface-400" />
              <span>
                Categories ({selectedCategories.length === 5 ? 'All' : selectedCategories.length})
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-surface-400 opacity-70" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in">
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-surface-800/80 mb-1">
                  <span className="text-[10px] uppercase font-semibold text-surface-400 tracking-wider">
                    Select Categories
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllCategories}
                    className="text-[11px] font-semibold text-brand-400 hover:text-brand-300"
                  >
                    Select All
                  </button>
                </div>

                {(Object.keys(CATEGORY_LABELS) as MarketCategory[]).map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between hover:bg-surface-850 transition-colors"
                    >
                      <span className={isChecked ? 'text-white font-medium' : 'text-surface-400'}>
                        {CATEGORY_LABELS[cat]}
                      </span>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-surface-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Widgets (Aesthetic Minimal Cards) */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-800/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                Tracked Targets
              </span>
              <div className="p-1.5 rounded-lg bg-surface-800/80 text-surface-300">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{filteredItems.length}</div>
              <div className="text-[11px] text-surface-500 mt-0.5">items actively monitored</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-800/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                Avg. Resale Spread
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                +{metrics.averageRoi}%
              </div>
              <div className="text-[11px] text-surface-500 mt-0.5">weighted ROI margin</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-800/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                Top Dollar Spread
              </span>
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="text-2xl font-bold text-brand-300 font-mono">
                +${(metrics.topItem.marketPrice - metrics.topItem.msrp).toFixed(0)}
              </div>
              <div className="text-[11px] text-surface-400 truncate mt-0.5" title={metrics.topItem.name}>
                {metrics.topItem.name}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-800/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                High Velocity
              </span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-400 font-mono">
                {metrics.ultraHighCount}
              </div>
              <div className="text-[11px] text-surface-500 mt-0.5">high demand restocks</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar (Clean Inset Toolbar) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-900/40 border border-surface-800/70 rounded-2xl px-4 py-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search items, sets, ASINs or SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-surface-950 border border-surface-800 rounded-xl pl-10 pr-4 text-xs text-white placeholder:text-surface-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 bg-surface-950 border border-surface-800 rounded-xl px-3 text-xs text-slate-200 outline-none cursor-pointer focus:border-brand-500 transition-all font-medium"
          >
            <option value="roi">Highest ROI (%)</option>
            <option value="profit">Highest Profit Margin ($)</option>
            <option value="price_high">Market Price (High to Low)</option>
            <option value="price_low">MSRP (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Market Items Grid (Aesthetic Seamless Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const profit = item.marketPrice - item.msrp;
          const roi = item.msrp > 0 
            ? Math.round((profit / item.msrp) * 100) 
            : (item.marketPrice > 0 ? 100 : 0);
          const retailerCfg = RETAILER_CONFIG[item.retailer] || {
            label: item.retailer,
            text: 'text-surface-300',
            bg: 'bg-surface-800',
            border: 'border-surface-700',
          };

          return (
            <div
              key={item.id}
              className="bg-surface-900/60 hover:bg-surface-900 border border-surface-800/60 hover:border-surface-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/40 group"
            >
              <div>
                {/* Header Category & Retailer Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                    <span className="text-xs font-medium text-surface-300">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    {item.isCustom && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.demand === 'ultra_high' && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                        <Flame className="w-3 h-3 text-rose-400" />
                        <span>Hot</span>
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${retailerCfg.text} ${retailerCfg.bg} ${retailerCfg.border}`}
                    >
                      {retailerCfg.label}
                    </span>
                  </div>
                </div>

                {/* Title & Set */}
                <h3
                  className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors leading-snug line-clamp-2"
                  title={item.name}
                >
                  {item.name}
                </h3>
                <span className="text-xs text-surface-400 block mt-1 truncate">
                  {item.setOrSeries}
                </span>

                {/* Clean Financial Spread Display */}
                <div className="mt-4 pt-3 border-t border-surface-850/60">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-surface-400 block">
                        Retail MSRP
                      </span>
                      <span className="text-sm font-bold text-slate-300 font-mono">
                        ${item.msrp.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-surface-400 block">
                        Secondary Market
                      </span>
                      <span className="text-sm font-bold text-white font-mono">
                        ${item.marketPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Clean Emerald Spread Banner */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        +{roi}% ROI
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-300 font-mono">
                        +${profit.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-emerald-500/80 font-medium">net</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Copyable SKU & 1-Click Task Creation */}
              <div className="pt-3 border-t border-surface-850/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyIdentifier(item.id, item.identifier)}
                    className="h-8 px-2.5 bg-surface-950/80 hover:bg-surface-800 border border-surface-800/80 rounded-xl text-xs font-mono text-surface-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    title="Click to copy identifier"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-surface-500 shrink-0" />
                    )}
                    <span>{item.identifier}</span>
                  </button>

                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomItem(item.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-xl bg-surface-950/80 hover:bg-rose-500/20 text-surface-500 hover:text-rose-400 border border-surface-800/80 transition-colors shrink-0"
                      title="Remove custom target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onCreateTaskWithItem) {
                      onCreateTaskWithItem({
                        retailer: item.retailer,
                        identifier: item.identifier,
                        name: item.name,
                        msrp: item.msrp,
                        marketPrice: item.marketPrice,
                      });
                    }
                  }}
                  className="h-8 px-3.5 bg-brand-500 hover:bg-brand-400 text-surface-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Track Custom Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-surface-800">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Track Custom Target by SKU / ASIN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-surface-400 leading-relaxed">
              Add any SKU or ASIN from Amazon, Best Buy, Target, or Walmart to monitor its spread and dispatch 1-click checkout tasks.
            </p>

            <form onSubmit={handleAddCustomItem} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Store / Retailer *
                  </label>
                  <select
                    value={customRetailer}
                    onChange={(e) => setCustomRetailer(e.target.value as Retailer)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
                  >
                    <option value="amazon">Amazon US</option>
                    <option value="bestbuy">Best Buy</option>
                    <option value="target">Target</option>
                    <option value="walmart">Walmart</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as MarketCategory)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
                  >
                    <option value="pokemon">Pokémon TCG</option>
                    <option value="onepiece">One Piece TCG</option>
                    <option value="sports">Sports Cards</option>
                    <option value="gaming">PC Hardware &amp; GPUs</option>
                    <option value="consoles">Consoles &amp; Tech</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                  Product Identifier (ASIN or SKU) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B0DF6K9Y9R or 6598712"
                  value={customIdentifier}
                  onChange={(e) => setCustomIdentifier(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prismatic Evolutions Surprise Box"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                  Set or Series (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scarlet &amp; Violet Special Set"
                  value={customSeries}
                  onChange={(e) => setCustomSeries(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Retail MSRP ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="29.99"
                    value={customMsrp}
                    onChange={(e) => setCustomMsrp(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">
                    Est. Market Value ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="55.00"
                    value={customMarketPrice}
                    onChange={(e) => setCustomMarketPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-400 text-surface-950 rounded-xl text-xs font-bold transition-all"
                >
                  Add to Live Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

