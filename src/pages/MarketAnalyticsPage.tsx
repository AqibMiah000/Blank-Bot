import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Filter,
  Search,
  ExternalLink,
  Flame,
  Plus,
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  CheckSquare,
  Square,
  DollarSign,
  Activity,
  Layers,
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
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const handleToggleCategory = (cat: MarketCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return; // keep at least 1
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
    <div className="flex-1 flex flex-col bg-surface-950 overflow-y-auto p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Live Market &amp; TCG Intelligence
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-surface-400 mt-1">
            Real-time secondary market valuations, MSRP profit margins, volume velocity, and 1-click drop task dispatch.
          </p>
        </div>

        {/* Action Controls: Refresh & Category Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-surface-900 hover:bg-surface-800 border border-surface-800 hover:border-surface-700 text-surface-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm group"
            title="Bypass 3-minute local cache and pull immediate live price ticks"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${
                isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
              }`}
            />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Live Prices'}</span>
            <span className="text-[10px] font-mono text-surface-500">({timeAgoString})</span>
          </button>

          {/* Category Dropdown Multi-Select */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="px-3.5 py-2 bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                Categories ({selectedCategories.length === 5 ? 'All' : selectedCategories.length})
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in">
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-surface-800/80 mb-1">
                  <span className="text-[10px] font-mono uppercase text-surface-400">
                    Tracked Markets
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllCategories}
                    className="text-[10px] font-bold text-brand-400 hover:underline"
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
                      className="w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between hover:bg-surface-800/70 transition-colors"
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

      {/* Metrics Banner */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800">
            <div className="text-[10px] font-mono text-surface-400 uppercase">Tracked Targets</div>
            <div className="text-xl font-bold text-white mt-1 font-mono flex items-center gap-2">
              <span>{filteredItems.length}</span>
              <span className="text-xs text-surface-500 font-sans font-normal">items</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800">
            <div className="text-[10px] font-mono text-surface-400 uppercase">Avg. Resale Spread</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>+{metrics.averageRoi}% ROI</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800">
            <div className="text-[10px] font-mono text-surface-400 uppercase">Top Dollar Spread</div>
            <div className="text-sm font-bold text-brand-300 mt-1 truncate">
              {metrics.topItem.name}
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              +${(metrics.topItem.marketPrice - metrics.topItem.msrp).toFixed(2)} Profit
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800">
            <div className="text-[10px] font-mono text-surface-400 uppercase">Ultra High Demand</div>
            <div className="text-xl font-bold text-rose-400 mt-1 font-mono flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>{metrics.ultraHighCount} Hot Drops</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-900/60 p-3 rounded-2xl border border-surface-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, sets, ASINs or SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-surface-600 focus:border-brand-500 outline-none font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-surface-400 font-mono text-[11px] uppercase">
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-surface-950 border border-surface-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-brand-500 outline-none cursor-pointer"
          >
            <option value="roi">Highest ROI (%)</option>
            <option value="profit">Highest Gross Margin ($)</option>
            <option value="price_high">Market Price (High &rarr; Low)</option>
            <option value="price_low">MSRP (Low &rarr; High)</option>
          </select>
        </div>
      </div>

      {/* Market Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const profit = item.marketPrice - item.msrp;
          const roi = Math.round((profit / item.msrp) * 100);

          return (
            <div
              key={item.id}
              className="bg-surface-900 border border-surface-800 hover:border-brand-500/40 rounded-2xl p-4.5 space-y-3.5 transition-all shadow-lg hover:shadow-brand-500/5 group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-800 text-surface-300 uppercase font-semibold">
                    {CATEGORY_LABELS[item.category]}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {item.demand === 'ultra_high' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                        <Flame className="w-3 h-3 text-rose-400" />
                        <span>High Demand</span>
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-300 font-bold">
                      {item.retailer}
                    </span>
                  </div>
                </div>

                {/* Item Title & Series */}
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <span className="text-[11px] text-surface-400 font-mono block mt-0.5">
                    {item.setOrSeries}
                  </span>
                </div>

                {/* Pricing Spread Card */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-surface-950/80 rounded-xl border border-surface-800/80 text-center">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-surface-500 block">
                      MSRP
                    </span>
                    <span className="text-xs font-bold text-slate-300 font-mono">
                      ${item.msrp.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-surface-500 block">
                      Market
                    </span>
                    <span className="text-xs font-bold text-white font-mono">
                      ${item.marketPrice.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block">
                      Est. Profit
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      +${profit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Profit ROI & Volume Footer */}
                <div className="flex items-center justify-between text-[11px] font-mono text-surface-400 px-0.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+{roi}% ROI</span>
                  </span>
                  {item.volume24h && <span>{item.volume24h}</span>}
                </div>
              </div>

              {/* Bottom Actions: Identifier & 1-Click Task Creation */}
              <div className="pt-2 border-t border-surface-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyIdentifier(item.id, item.identifier)}
                  className="px-2.5 py-1.5 bg-surface-950 hover:bg-surface-800 border border-surface-800 rounded-lg text-[10px] font-mono text-surface-300 flex items-center gap-1.5 transition-all"
                  title="Copy ASIN or SKU"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
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
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-3.5 h-3.5" />
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
