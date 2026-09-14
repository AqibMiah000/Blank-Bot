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
} from 'lucide-react';
import { MarketItem, MarketCategory, Retailer } from '../types';
import { getMarketAnalytics, MarketMetricsSummary } from '../utils/market-analytics';

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
      if (selectedCategories.length === 1) return; // Keep at least one
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
        const roiA = (profitA / a.msrp) * 100;
        const roiB = (profitB / b.msrp) * 100;

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
    <div className="flex-1 flex flex-col bg-surface-950 overflow-y-auto p-5 md:p-6 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-surface-900">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Live Market &amp; TCG Intelligence
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-medium tracking-wide">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-surface-400 mt-1">
            Real-time secondary market valuations, MSRP profit margins, volume velocity, and 1-click drop dispatch.
          </p>
        </div>

        {/* Action Controls: Refresh & Category Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="h-8 px-3 bg-surface-900 hover:bg-surface-850 border border-surface-800 text-surface-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-all group"
            title="Force refresh live quotes"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${
                isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
              }`}
            />
            <span>{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
            <span className="text-[11px] text-surface-500 font-mono">({timeAgoString})</span>
          </button>

          {/* Category Dropdown Multi-Select */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="h-8 px-3 bg-surface-900 hover:bg-surface-850 border border-surface-800 text-surface-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-all"
            >
              <Filter className="w-3.5 h-3.5 text-surface-400" />
              <span>
                Categories ({selectedCategories.length === 5 ? 'All' : selectedCategories.length})
              </span>
              <ChevronDown className="w-3 h-3 text-surface-400" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-900 border border-surface-800 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-surface-800/80 mb-1">
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
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between hover:bg-surface-850 transition-colors"
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

      {/* Top 4 Metrics Cards (Clean & Minimal) */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-900/90 border border-surface-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">
              Tracked Targets
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-white font-mono">{filteredItems.length}</span>
              <span className="text-xs text-surface-500">items listed</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-900/90 border border-surface-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">
              Avg. Resale Spread
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-400 font-mono">+{metrics.averageRoi}%</span>
              <span className="text-xs text-surface-500">ROI margin</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-900/90 border border-surface-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">
              Top Dollar Spread
            </span>
            <div className="mt-2 flex items-baseline justify-between gap-2 overflow-hidden">
              <span className="text-xl font-bold text-brand-300 font-mono shrink-0">
                +${(metrics.topItem.marketPrice - metrics.topItem.msrp).toFixed(0)}
              </span>
              <span className="text-xs text-surface-400 truncate text-right" title={metrics.topItem.name}>
                {metrics.topItem.name.replace(/NVIDIA GeForce /i, '')}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-900/90 border border-surface-800/80 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">
              High Demand
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <Flame className="w-4 h-4 text-rose-400 self-center" />
              <span className="text-xl font-bold text-rose-400 font-mono">{metrics.ultraHighCount}</span>
              <span className="text-xs text-surface-500">hot drops</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, sets, ASINs or SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 bg-surface-900 border border-surface-800 rounded-lg pl-8.5 pr-3 text-xs text-slate-100 placeholder:text-surface-500 focus:border-brand-500/60 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
          <span className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-8.5 bg-surface-900 border border-surface-800 rounded-lg px-2.5 text-xs text-slate-200 outline-none cursor-pointer focus:border-brand-500/60"
          >
            <option value="roi">Highest ROI (%)</option>
            <option value="profit">Highest Profit Margin ($)</option>
            <option value="price_high">Market Price (High to Low)</option>
            <option value="price_low">MSRP (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Market Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredItems.map((item) => {
          const profit = item.marketPrice - item.msrp;
          const roi = Math.round((profit / item.msrp) * 100);

          return (
            <div
              key={item.id}
              className="bg-surface-900/80 hover:bg-surface-900 border border-surface-800/80 hover:border-surface-700/80 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors shadow-sm"
            >
              <div className="space-y-2.5">
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-800/70 text-surface-300">
                    {CATEGORY_LABELS[item.category]}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.demand === 'ultra_high' && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                        <Flame className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>Hot</span>
                      </span>
                    )}
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-800 text-surface-300 border border-surface-700/50">
                      {item.retailer}
                    </span>
                  </div>
                </div>

                {/* Title & Series */}
                <div>
                  <h3
                    className="text-xs font-semibold text-slate-100 leading-snug line-clamp-1"
                    title={item.name}
                  >
                    {item.name}
                  </h3>
                  <span className="text-[11px] text-surface-400 block mt-0.5 truncate">
                    {item.setOrSeries}
                  </span>
                </div>

                {/* Clean, Spacious Pricing Breakdown (Zero Overflow) */}
                <div className="bg-surface-950/70 rounded-lg p-2.5 border border-surface-800/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-surface-400">MSRP</span>
                      <span className="font-semibold text-slate-300 font-mono">
                        ${item.msrp.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-surface-400">Market</span>
                      <span className="font-bold text-white font-mono">
                        ${item.marketPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-surface-850">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+{roi}% ROI</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        +${profit.toFixed(2)}
                      </span>
                      {item.volume24h && (
                        <span className="text-[10px] text-surface-500 font-mono">
                          ({item.volume24h})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Identifier & 1-Click Task Creation */}
              <div className="pt-2 border-t border-surface-800/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyIdentifier(item.id, item.identifier)}
                  className="h-7.5 px-2.5 bg-surface-950/80 hover:bg-surface-800/80 border border-surface-800/60 rounded-lg text-[11px] font-mono text-surface-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                  title="Click to copy identifier"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 text-surface-500 shrink-0" />
                  )}
                  <span>{item.identifier}</span>
                </button>

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
                  className="h-7.5 px-3 bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 hover:border-brand-500/50 text-brand-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-400" />
                  <span>Create Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

