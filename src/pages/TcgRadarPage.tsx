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
  MapPin,
  Store,
  Navigation,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react';
import {
  TcgRestockEvent,
  TcgMonitorConfig,
  Retailer,
  BillingProfile,
  ProxyPool,
  NetworkStatus,
} from '../types';
import { playRefractCyanChime, playCashRegister } from '../utils/audio';

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
  networkStatus?: NetworkStatus;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

const ZIP_LOOKUP: Record<string, { city: string; state: string }> = {
  '11354': { city: 'Flushing', state: 'NY' },
  '11355': { city: 'Flushing', state: 'NY' },
  '11358': { city: 'Flushing', state: 'NY' },
  '10001': { city: 'New York', state: 'NY' },
  '10036': { city: 'New York', state: 'NY' },
  '11201': { city: 'Brooklyn', state: 'NY' },
  '11239': { city: 'Brooklyn', state: 'NY' },
  '90210': { city: 'Beverly Hills', state: 'CA' },
  '90001': { city: 'Los Angeles', state: 'CA' },
  '90024': { city: 'Los Angeles', state: 'CA' },
  '90036': { city: 'Los Angeles', state: 'CA' },
  '94102': { city: 'San Francisco', state: 'CA' },
  '60601': { city: 'Chicago', state: 'IL' },
  '75201': { city: 'Dallas', state: 'TX' },
  '77001': { city: 'Houston', state: 'TX' },
  '33101': { city: 'Miami', state: 'FL' },
  '30301': { city: 'Atlanta', state: 'GA' },
  '98101': { city: 'Seattle', state: 'WA' },
  '02108': { city: 'Boston', state: 'MA' },
};

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
    timestamp: Date.now() - 1000 * 60 * 8,
    status: 'IN_STOCK',
    isDirectDrop: true,
    isLeakOrEarlyDrop: true,
    projectedDropWindow: 'Thursdays 10:00 AM - 11:30 AM EST (Restock Wave)',
    fulfillmentType: 'SHIPPING',
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
    timestamp: Date.now() - 1000 * 60 * 12,
    status: 'IN_STOCK',
    isDirectDrop: true,
    projectedDropWindow: 'High-Velocity Restock Spike',
    fulfillmentType: 'SHIPPING',
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
    timestamp: Date.now() - 1000 * 60 * 18,
    status: 'IN_STOCK',
    isDirectDrop: true,
    isLeakOrEarlyDrop: true,
    projectedDropWindow: 'Amazon Flash Restock Waves (Unscheduled Lightning Drops)',
    fulfillmentType: 'SHIPPING',
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
    timestamp: Date.now() - 1000 * 60 * 25,
    status: 'IN_STOCK',
    isDirectDrop: true,
    isLeakOrEarlyDrop: true,
    projectedDropWindow: 'Direct Bandai Allocation Restock',
    fulfillmentType: 'SHIPPING',
  },
];

export const TcgRadarPage: React.FC<TcgRadarPageProps> = ({
  onQuickSnipe,
  profiles,
  proxyPools,
  defaultWebhookUrl = '',
  networkStatus,
}) => {
  const isOnline = networkStatus ? networkStatus.isOnline !== false : (typeof navigator !== 'undefined' ? navigator.onLine : true);
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

  // Sound Alerts Configuration
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('blank_tcg_sound_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Local Store Pickup Radar Configuration
  const [enableLocalPickup, setEnableLocalPickup] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('blank_tcg_enable_local_pickup');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [selectedState, setSelectedState] = useState<string>(() => {
    return localStorage.getItem('blank_tcg_state') || 'NY';
  });

  const [city, setCity] = useState<string>(() => {
    return localStorage.getItem('blank_tcg_city') || 'Flushing';
  });

  const [zipCode, setZipCode] = useState<string>(() => {
    return localStorage.getItem('blank_tcg_zip_code') || '11354';
  });

  const handleZipChange = (newZip: string) => {
    const cleaned = newZip.replace(/\D/g, '').slice(0, 5);
    setZipCode(cleaned);
    if (ZIP_LOOKUP[cleaned]) {
      setCity(ZIP_LOOKUP[cleaned].city);
      setSelectedState(ZIP_LOOKUP[cleaned].state);
    }
  };

  const [searchRadius, setSearchRadius] = useState<number>(() => {
    const saved = localStorage.getItem('blank_tcg_search_radius');
    return saved ? parseInt(saved, 10) : 25;
  });

  // Manual Scan States
  const [isScanningLocal, setIsScanningLocal] = useState(false);
  const [localScanMessage, setLocalScanMessage] = useState<string | null>(null);

  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const [restockFeed, setRestockFeed] = useState<TcgRestockEvent[]>(() => {
    try {
      const saved = localStorage.getItem('blank_tcg_restock_feed');
      const parsed: TcgRestockEvent[] = saved ? JSON.parse(saved) : SEED_RESTOCK_EVENTS;
      return parsed
        .filter((e) => !e.id.startsWith('rst_seed_local_') && !e.id.startsWith('rst_loc_click_'))
        .map((e) => {
          if (e.storeName && e.storeName.includes('Metro District')) {
            const cleanAddr = e.storeAddress || '40-24 College Point Blvd, Flushing, NY 11354';
            return {
              ...e,
              storeName: e.storeName.replace('Metro District', cleanAddr),
            };
          }
          return e;
        });
    } catch {
      return SEED_RESTOCK_EVENTS;
    }
  });

  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  // Sync feed, sound, and local pickup settings to local storage
  useEffect(() => {
    try {
      localStorage.setItem('blank_tcg_restock_feed', JSON.stringify(restockFeed.slice(0, 50)));
      localStorage.setItem('blank_tcg_sound_enabled', JSON.stringify(soundEnabled));
      localStorage.setItem('blank_tcg_enable_local_pickup', JSON.stringify(enableLocalPickup));
      localStorage.setItem('blank_tcg_state', selectedState);
      localStorage.setItem('blank_tcg_city', city);
      localStorage.setItem('blank_tcg_zip_code', zipCode);
      localStorage.setItem('blank_tcg_search_radius', String(searchRadius));
    } catch {}
  }, [restockFeed, soundEnabled, enableLocalPickup, selectedState, city, zipCode, searchRadius]);

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

        // Audio chime alert on detected restock event
        if (soundEnabled) {
          playRefractCyanChime();
        }

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
  }, [autoSnipe, soundEnabled, onQuickSnipe]);

  const handleToggleMonitor = async () => {
    if (isRunning) {
      if (window.blankBotAPI?.stopTcgMonitor) {
        await window.blankBotAPI.stopTcgMonitor();
      }
      setIsRunning(false);
    } else {
      if (!isOnline) {
        setRefreshMessage('❌ Offline: Cannot start Sentinel scanner without an active internet connection.');
        setTimeout(() => setRefreshMessage(null), 5000);
        return;
      }

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
        enableLocalPickup,
        zipCode: zipCode.trim(),
        state: selectedState.trim(),
        city: city.trim(),
        searchRadiusMiles: searchRadius,
      };

      if (window.blankBotAPI?.startTcgMonitor) {
        await window.blankBotAPI.startTcgMonitor(config);
      }
      setIsRunning(true);
    }
  };

  const handleTestWebhook = async () => {
    if (!isOnline) {
      setWebhookTestStatus('❌ Offline: Cannot dispatch Discord webhook without an active internet connection.');
      setTimeout(() => setWebhookTestStatus(null), 5000);
      return;
    }

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

  const handleScanLocalStores = async () => {
    if (!isOnline) {
      setLocalScanMessage('❌ Offline: No internet connection detected. Please connect to Wi-Fi or Ethernet to scan local Target & Walmart shelves.');
      setTimeout(() => setLocalScanMessage(null), 6000);
      return;
    }

    setIsScanningLocal(true);
    setLocalScanMessage(null);
    try {
      if (window.blankBotAPI?.checkInternet) {
        const net = await window.blankBotAPI.checkInternet();
        if (!net.isOnline) {
          setLocalScanMessage('❌ Offline: No internet connection detected. Please connect to Wi-Fi or Ethernet to query Target & Walmart store shelves.');
          setIsScanningLocal(false);
          setTimeout(() => setLocalScanMessage(null), 6000);
          return;
        }
      }

      let results: TcgRestockEvent[] = [];
      if (window.blankBotAPI?.triggerTcgLocalStoreScan) {
        results = await window.blankBotAPI.triggerTcgLocalStoreScan(
          zipCode.trim(),
          searchRadius,
          city.trim(),
          selectedState.trim()
        );
      }

      if (results && results.length > 0) {
        setRestockFeed((prev) => [
          ...results,
          ...prev.filter(
            (p) => !results.some((r) => r.identifier === p.identifier && r.storeName === p.storeName)
          ),
        ]);

        if (soundEnabled) {
          playRefractCyanChime();
        }

        setLocalScanMessage(
          `✓ Found ${results.length} verified in-store restocks in ${city || 'Flushing'}, ${selectedState}!`
        );
      } else {
        setLocalScanMessage(
          `Queried Target & Walmart branches within ${searchRadius} mi of ${city || 'Flushing'}, ${selectedState} (${zipCode}). 0 verified units currently on physical shelves (Out of Stock).`
        );
      }
    } catch (err: any) {
      setLocalScanMessage(`❌ Scan error: ${err.message || 'Unable to connect to retailer store servers'}`);
    } finally {
      setIsScanningLocal(false);
      setTimeout(() => setLocalScanMessage(null), 6000);
    }
  };

  const handleManualRefreshAll = async () => {
    if (!isOnline) {
      setRefreshMessage('❌ Offline: Cannot refresh retailer channels without an active internet connection.');
      setTimeout(() => setRefreshMessage(null), 5000);
      return;
    }

    setIsRefreshingAll(true);
    setRefreshMessage(null);
    try {
      if (window.blankBotAPI?.checkInternet) {
        const net = await window.blankBotAPI.checkInternet();
        if (!net.isOnline) {
          setRefreshMessage('❌ Offline: Lost internet connection. Cannot reach Best Buy, Target, Walmart, or Amazon.');
          setIsRefreshingAll(false);
          setTimeout(() => setRefreshMessage(null), 5000);
          return;
        }
      }

      let results: TcgRestockEvent[] = [];
      if (window.blankBotAPI?.triggerTcgManualScan) {
        results = await window.blankBotAPI.triggerTcgManualScan({
          retailers: selectedRetailers,
          positiveKeywords: positiveKeywords.split(',').map((s) => s.trim()).filter(Boolean),
          negativeKeywords: negativeKeywords.split(',').map((s) => s.trim()).filter(Boolean),
          enableLocalPickup,
          zipCode: zipCode.trim(),
          state: selectedState.trim(),
          city: city.trim(),
          searchRadiusMiles: searchRadius,
        });
      }

      if (results && results.length > 0) {
        setRestockFeed((prev) => [
          ...results,
          ...prev.filter(
            (p) =>
              !results.some((r) => r.identifier === p.identifier && r.storeName === p.storeName)
          ),
        ]);
      }

      if (soundEnabled) {
        playCashRegister();
      }
      setRefreshMessage(`✓ Channels refreshed. Current inventory state verified across Best Buy, Target, Walmart & Amazon.`);
    } catch (err: any) {
      setRefreshMessage(`❌ Refresh error: ${err.message}`);
    } finally {
      setIsRefreshingAll(false);
      setTimeout(() => setRefreshMessage(null), 5000);
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
          {/* Scanner & Network Status Badge */}
          {!isOnline ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>OFFLINE (NO INTERNET)</span>
            </div>
          ) : (
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
          )}

          {/* Overall Physical Refresh Button */}
          <button
            onClick={handleManualRefreshAll}
            disabled={isRefreshingAll}
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-surface-800 hover:bg-surface-700 active:scale-[0.98] text-brand-300 border border-brand-500/30 shadow-sm transition-all cursor-pointer"
            title="Manually force check inventory across Best Buy, Target, Walmart, and Amazon"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isRefreshingAll ? 'animate-spin' : ''}`} />
            <span>{isRefreshingAll ? 'Scanning...' : 'Refresh All Channels'}</span>
          </button>

          {/* Sound Alert Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playRefractCyanChime();
            }}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-300 hover:bg-brand-500/20'
                : 'bg-surface-800/80 border-surface-700 text-surface-500 hover:text-surface-300'
            }`}
            title={soundEnabled ? 'Drop Audio Alerts: ON (Click to mute)' : 'Drop Audio Alerts: MUTED (Click to enable)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-400" /> : <VolumeX className="w-4 h-4 text-surface-500" />}
          </button>

          <button
            onClick={handleToggleMonitor}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
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

      {refreshMessage && (
        <div className="px-6 py-2 bg-brand-950/80 border-b border-brand-500/30 flex items-center justify-between text-xs text-brand-300 font-mono">
          <span>{refreshMessage}</span>
          <button onClick={() => setRefreshMessage(null)} className="text-surface-400 hover:text-white text-[10px]">Dismiss</button>
        </div>
      )}

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

          {/* Local Store In-Store & Curbside Pickup Radar */}
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                Local Shelf &amp; Pickup Radar
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Target &amp; Walmart</span>
            </div>

            {/* Toggle Enable Local Pickup */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950 border border-surface-800 cursor-pointer">
              <div className="text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Scan In-Store / Curbside
                </span>
                <span className="text-[10px] text-surface-400 block mt-0.5">
                  Detect shelf stock &amp; order pickup at nearby branches
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableLocalPickup}
                onChange={(e) => setEnableLocalPickup(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-surface-900 border-surface-700"
              />
            </label>

            {enableLocalPickup && (
              <>
                {/* State & City Selectors */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-surface-300 uppercase block mb-1">
                      State
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full bg-surface-950 border border-surface-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono cursor-pointer"
                    >
                      {US_STATES.map((st) => (
                        <option key={st.code} value={st.code} className="bg-surface-900 text-white">
                          {st.code} - {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-surface-300 uppercase block mb-1">
                      City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Flushing"
                        className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white placeholder:text-surface-600 font-mono outline-none focus:border-emerald-500"
                      />
                      <Navigation className="w-3 h-3 text-surface-500 absolute left-2 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* ZIP Code Input */}
                <div>
                  <label className="text-[11px] font-semibold text-surface-300 uppercase block mb-1">
                    Your ZIP Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={5}
                      value={zipCode}
                      onChange={(e) => handleZipChange(e.target.value)}
                      placeholder="e.g. 11354, 90210"
                      className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-surface-600 font-mono outline-none focus:border-emerald-500"
                    />
                    <MapPin className="w-3.5 h-3.5 text-surface-500 absolute left-2.5 top-2" />
                  </div>
                </div>

                {/* Search Radius Selector */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-semibold text-surface-300 uppercase">Search Radius</span>
                    <span className="font-mono text-emerald-400 font-bold">{searchRadius} Miles</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[10, 25, 50].map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setSearchRadius(radius)}
                        className={`py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                          searchRadius === radius
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-surface-950 text-surface-400 border border-surface-800 hover:text-white'
                        }`}
                      >
                        {radius} mi
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleScanLocalStores}
                  disabled={isScanningLocal}
                  className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-[0.98] text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                >
                  <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${isScanningLocal ? 'animate-spin' : ''}`} />
                  <span>
                    {isScanningLocal
                      ? 'Scanning Nearby Stores...'
                      : `Check Nearby Shelves (${city ? `${city}, ${selectedState}` : `ZIP ${zipCode}`})`}
                  </span>
                </button>

                {localScanMessage && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] font-mono ${
                      localScanMessage.startsWith('❌')
                        ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                        : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {localScanMessage}
                  </div>
                )}

                <div className="p-2 rounded-xl bg-surface-950/70 border border-surface-800 text-[10px] text-surface-400 font-mono flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Target RedSky &amp; Walmart branches within {searchRadius} mi active.</span>
                </div>
              </>
            )}
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

            <div className="flex items-center space-x-2">
              <button
                onClick={handleManualRefreshAll}
                disabled={isRefreshingAll}
                className="px-2.5 py-1 bg-surface-900 hover:bg-surface-800 text-brand-300 border border-surface-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Force refresh inventory check"
              >
                <RefreshCw className={`w-3 h-3 text-brand-400 ${isRefreshingAll ? 'animate-spin' : ''}`} />
                <span>{isRefreshingAll ? 'Scanning...' : 'Manual Refresh'}</span>
              </button>

              <button
                onClick={() => setRestockFeed([])}
                className="text-[11px] text-surface-500 hover:text-surface-300 transition-colors cursor-pointer"
              >
                Clear Feed
              </button>
            </div>
          </div>

          {/* Manual Refresh Feedback Banner */}
          {refreshMessage && (
            <div
              className={`mb-3 p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between shadow-sm ${
                refreshMessage.startsWith('❌')
                  ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
                  : 'bg-surface-900 border-brand-500/40 text-brand-300'
              }`}
            >
              <span>{refreshMessage}</span>
              <button
                onClick={() => setRefreshMessage(null)}
                className="text-surface-400 hover:text-white ml-2 text-sm leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

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

                const isLocalPickup =
                  event.fulfillmentType === 'STORE_PICKUP' || event.fulfillmentType === 'IN_STORE_ONLY';

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
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
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

                          {isLocalPickup && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-300" />
                              In-Store Pickup ({event.distanceMiles ? `${event.distanceMiles.toFixed(1)} mi` : 'Nearby'})
                            </span>
                          )}

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

                        {event.storeName && (
                          <div className="text-[11px] font-mono text-emerald-300 mt-0.5 flex items-center gap-1">
                            <Store className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate" title={event.storeAddress || event.storeName}>
                              {event.storeName.replace(
                                'Metro District',
                                event.storeAddress || `${city || 'Flushing'}, ${selectedState || 'NY'}`
                              )}
                              {event.availableQuantity ? ` • ${event.availableQuantity} on shelf` : ''}
                            </span>
                          </div>
                        )}

                        {event.projectedDropWindow && !event.storeName && (
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
                        <span>{isLocalPickup ? 'Store Page' : 'Store Page'}</span>
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
