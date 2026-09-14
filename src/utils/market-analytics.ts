import { MarketItem, MarketCategory } from '../types';

let cachedItems: MarketItem[] | null = null;
let lastFetchEpoch: number = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 Minutes

const SEED_MARKET_ITEMS: MarketItem[] = [
  // POKÉMON TCG
  {
    id: 'poke-151-bundle',
    name: 'Pokémon 151 Booster Bundle (6 Packs)',
    setOrSeries: 'Scarlet & Violet 151',
    category: 'pokemon',
    retailer: 'bestbuy',
    identifier: '6548485',
    msrp: 28.99,
    marketPrice: 48.50,
    volume24h: '1,420 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Massive demand across Best Buy & Target restocks. 67% profit spread.',
  },
  {
    id: 'poke-prism-etb',
    name: 'Prismatic Evolutions Elite Trainer Box',
    setOrSeries: 'Special Prismatic Evolutions',
    category: 'pokemon',
    retailer: 'target',
    identifier: '89472619',
    msrp: 54.99,
    marketPrice: 94.00,
    volume24h: '2,890 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Eeveelutions special set. Eevee promo card & 9 booster packs.',
  },
  {
    id: 'poke-prism-bundle',
    name: 'Prismatic Evolutions Booster Bundle (6 Packs)',
    setOrSeries: 'Special Prismatic Evolutions',
    category: 'pokemon',
    retailer: 'amazon',
    identifier: 'B0DHQ6Z9PQ',
    msrp: 29.99,
    marketPrice: 57.50,
    volume24h: '3,110 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Best Buy / Amazon drop targets with 91% ROI.',
  },
  {
    id: 'poke-151-upc',
    name: 'Pokémon 151 Ultra Premium Collection',
    setOrSeries: 'Scarlet & Violet 151',
    category: 'pokemon',
    retailer: 'bestbuy',
    identifier: '6548484',
    msrp: 119.99,
    marketPrice: 169.00,
    volume24h: '680 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Features Mew metal card + Mewtwo illustration rare promo.',
  },
  {
    id: 'poke-cz-sea-sky',
    name: 'Crown Zenith Premium Collection: Sea & Sky',
    setOrSeries: 'Crown Zenith Special Release',
    category: 'pokemon',
    retailer: 'amazon',
    identifier: 'B0D7MNLK7G',
    msrp: 39.99,
    marketPrice: 69.50,
    volume24h: '1,120 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Includes 14 Crown Zenith booster packs + Rayquaza & Kyogre promos.',
  },

  // ONE PIECE TCG
  {
    id: 'op-05-box',
    name: 'One Piece OP-05 Awakening of the New Era Booster Box',
    setOrSeries: 'One Piece Card Game (OP-05)',
    category: 'onepiece',
    retailer: 'amazon',
    identifier: 'B0CBRYJ6F6',
    msrp: 107.76,
    marketPrice: 219.00,
    volume24h: '410 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Manga Gear 5 Luffy chase card makes this box extremely lucrative.',
  },
  {
    id: 'op-06-box',
    name: 'One Piece OP-06 Wings of the Captain Booster Box',
    setOrSeries: 'One Piece Card Game (OP-06)',
    category: 'onepiece',
    retailer: 'amazon',
    identifier: 'B0CKW5C6Z2',
    msrp: 107.76,
    marketPrice: 162.50,
    volume24h: '320 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Features Zoro & Sanji leaders + Manga Zoro secret rare.',
  },
  {
    id: 'op-prb01-box',
    name: 'One Piece PRB-01 The Best Premium Booster Box',
    setOrSeries: 'PRB-01 Premium Reprint',
    category: 'onepiece',
    retailer: 'bestbuy',
    identifier: '6589312',
    msrp: 119.99,
    marketPrice: 205.00,
    volume24h: '550 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'High-tier reprint set with holographic DON! cards and Gold Manga prints.',
  },

  // SPORTS CARDS
  {
    id: 'sports-prizm-fb',
    name: '2024 Panini Prizm Football Blaster Box',
    setOrSeries: 'Panini Prizm NFL 2024',
    category: 'sports',
    retailer: 'walmart',
    identifier: '549382103',
    msrp: 34.98,
    marketPrice: 74.00,
    volume24h: '1,850 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Caleb Williams & Jayden Daniels rookie Silver Prizms driving massive spread.',
  },
  {
    id: 'sports-topps-chrome-bb',
    name: '2024 Topps Chrome Baseball Value Box',
    setOrSeries: 'Topps Chrome MLB 2024',
    category: 'sports',
    retailer: 'target',
    identifier: '89201948',
    msrp: 39.99,
    marketPrice: 65.00,
    volume24h: '940 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Paul Skenes & Elly De La Cruz rookie refractors.',
  },

  // PC HARDWARE & GPUS
  {
    id: 'gpu-rtx-5090-fe',
    name: 'NVIDIA GeForce RTX 5090 32GB Founders Edition',
    setOrSeries: 'Blackwell RTX 50 Series',
    category: 'gaming',
    retailer: 'bestbuy',
    identifier: '6614151',
    msrp: 1999.99,
    marketPrice: 2890.00,
    volume24h: '180 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Flagship Blackwell GPU. Instant sellout on Best Buy drops.',
  },
  {
    id: 'gpu-rtx-5080-fe',
    name: 'NVIDIA GeForce RTX 5080 16GB Founders Edition',
    setOrSeries: 'Blackwell RTX 50 Series',
    category: 'gaming',
    retailer: 'bestbuy',
    identifier: '6614152',
    msrp: 999.99,
    marketPrice: 1420.00,
    volume24h: '240 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'High-volume target with ~$420 gross margin per unit.',
  },
  {
    id: 'cpu-9800x3d',
    name: 'AMD Ryzen 7 9800X3D Gaming Processor',
    setOrSeries: 'Zen 5 3D V-Cache',
    category: 'gaming',
    retailer: 'amazon',
    identifier: 'B0DKF57C45',
    msrp: 479.00,
    marketPrice: 595.00,
    volume24h: '610 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Best gaming CPU on market. Continuous rapid restocks on Amazon & Best Buy.',
  },

  // CONSOLES & HARDWARE
  {
    id: 'console-ps5-pro',
    name: 'Sony PlayStation 5 Pro Console',
    setOrSeries: 'PlayStation 5 Generation',
    category: 'consoles',
    retailer: 'amazon',
    identifier: 'B0DFW6ZFWF',
    msrp: 699.99,
    marketPrice: 795.00,
    volume24h: '520 sales',
    demand: 'moderate',
    lastUpdated: Date.now(),
    notes: 'PSSR AI upscaling 2TB console restocks.',
  },
];

export interface MarketMetricsSummary {
  totalTracked: number;
  averageRoi: number;
  topItem: MarketItem;
  ultraHighCount: number;
  lastUpdated: number;
}

export function getMarketAnalytics(forceRefresh: boolean = false): {
  items: MarketItem[];
  metrics: MarketMetricsSummary;
} {
  const now = Date.now();

  if (!cachedItems || forceRefresh || now - lastFetchEpoch > CACHE_TTL_MS) {
    cachedItems = SEED_MARKET_ITEMS.map((item) => {
      const variance = forceRefresh ? (Math.random() * 2 - 1) * 0.015 : 0;
      const updatedPrice = Math.round(item.marketPrice * (1 + variance) * 100) / 100;

      return {
        ...item,
        marketPrice: updatedPrice,
        lastUpdated: now,
      };
    });
    lastFetchEpoch = now;
  }

  let totalRoi = 0;
  let topItem = cachedItems[0];
  let maxProfit = 0;
  let ultraHighCount = 0;

  for (const item of cachedItems) {
    const profit = item.marketPrice - item.msrp;
    const roi = (profit / item.msrp) * 100;
    totalRoi += roi;

    if (profit > maxProfit) {
      maxProfit = profit;
      topItem = item;
    }

    if (item.demand === 'ultra_high') {
      ultraHighCount++;
    }
  }

  const averageRoi = Math.round(totalRoi / cachedItems.length);

  return {
    items: [...cachedItems],
    metrics: {
      totalTracked: cachedItems.length,
      averageRoi,
      topItem,
      ultraHighCount,
      lastUpdated: lastFetchEpoch,
    },
  };
}
