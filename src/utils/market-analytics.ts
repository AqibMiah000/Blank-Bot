import { MarketItem, MarketCategory, Retailer } from '../types';

const CUSTOM_ITEMS_KEY = 'blank_custom_market_items';

export function getCustomMarketItems(): MarketItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ITEMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomMarketItem(item: {
  name: string;
  setOrSeries: string;
  category: MarketCategory;
  retailer: Retailer;
  identifier: string;
  msrp: number;
  marketPrice: number;
  demand?: 'ultra_high' | 'high' | 'moderate';
  notes?: string;
}): MarketItem {
  const newItem: MarketItem = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: item.name.trim() || `Custom ${item.identifier}`,
    setOrSeries: item.setOrSeries.trim() || 'Custom Added',
    category: item.category,
    retailer: item.retailer,
    identifier: item.identifier.trim(),
    msrp: Number(item.msrp) || 0,
    marketPrice: Number(item.marketPrice) || Number(item.msrp) || 0,
    volume24h: 'Active Tracking',
    demand: item.demand || 'high',
    notes: item.notes || 'User-defined custom target',
    lastUpdated: Date.now(),
    isCustom: true,
  };

  const current = getCustomMarketItems();
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom market item', err);
  }
  return newItem;
}

export function deleteCustomMarketItem(id: string): void {
  const current = getCustomMarketItems();
  const filtered = current.filter((i) => i.id !== id);
  try {
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete custom market item', err);
  }
}

let cachedItems: MarketItem[] | null = null;
let lastFetchEpoch: number = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 Minutes

export const SEED_MARKET_ITEMS: MarketItem[] = [
  // ==========================================
  // POKÉMON TCG — NEWEST & HIGH-DEMAND SETS
  // ==========================================
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
    notes: 'Eeveelutions special set with Eevee promo & 9 booster packs.',
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
    notes: 'Best Buy / Amazon drop target with 91% ROI.',
  },
  {
    id: 'poke-prism-surprise',
    name: 'Prismatic Evolutions Surprise Box',
    setOrSeries: 'Special Prismatic Evolutions',
    category: 'pokemon',
    retailer: 'bestbuy',
    identifier: '6598714',
    msrp: 24.99,
    marketPrice: 46.50,
    volume24h: '1,780 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Randomized Eevee promo + 4 booster packs.',
  },
  {
    id: 'poke-prism-binder',
    name: 'Prismatic Evolutions Binder Collection',
    setOrSeries: 'Special Prismatic Evolutions',
    category: 'pokemon',
    retailer: 'target',
    identifier: '89472620',
    msrp: 29.99,
    marketPrice: 52.00,
    volume24h: '1,450 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: '9-pocket portfolio with 5 Prismatic packs.',
  },
  {
    id: 'poke-surging-bb',
    name: 'Surging Sparks Booster Box (36 Packs)',
    setOrSeries: 'Scarlet & Violet Surging Sparks',
    category: 'pokemon',
    retailer: 'amazon',
    identifier: 'B0DGPJ2K9R',
    msrp: 161.64,
    marketPrice: 215.00,
    volume24h: '2,100 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Pikachu ex Special Illustration Rare chase driving high box prices.',
  },
  {
    id: 'poke-surging-etb',
    name: 'Surging Sparks Elite Trainer Box',
    setOrSeries: 'Scarlet & Violet Surging Sparks',
    category: 'pokemon',
    retailer: 'bestbuy',
    identifier: '6590214',
    msrp: 54.99,
    marketPrice: 69.50,
    volume24h: '1,890 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Magneton illustration promo + 9 booster packs.',
  },
  {
    id: 'poke-surging-bundle',
    name: 'Surging Sparks Booster Bundle (6 Packs)',
    setOrSeries: 'Scarlet & Violet Surging Sparks',
    category: 'pokemon',
    retailer: 'target',
    identifier: '89312455',
    msrp: 26.94,
    marketPrice: 42.00,
    volume24h: '2,300 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Top tier pack-per-dollar retail ratio.',
  },
  {
    id: 'poke-stellar-etb',
    name: 'Stellar Crown Elite Trainer Box',
    setOrSeries: 'Scarlet & Violet Stellar Crown',
    category: 'pokemon',
    retailer: 'bestbuy',
    identifier: '6586311',
    msrp: 54.99,
    marketPrice: 58.00,
    volume24h: '780 sales',
    demand: 'moderate',
    lastUpdated: Date.now(),
    notes: 'Noctowl illustration rare promo card.',
  },
  {
    id: 'poke-twilight-bb',
    name: 'Twilight Masquerade Booster Box (36 Packs)',
    setOrSeries: 'Scarlet & Violet Twilight Masquerade',
    category: 'pokemon',
    retailer: 'amazon',
    identifier: 'B0CZ7S8M99',
    msrp: 161.64,
    marketPrice: 192.00,
    volume24h: '1,560 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Greninja ex Special Illustration Rare ($300+ card) anchors box value.',
  },
  {
    id: 'poke-twilight-bundle',
    name: 'Twilight Masquerade Booster Bundle (6 Packs)',
    setOrSeries: 'Scarlet & Violet Twilight Masquerade',
    category: 'pokemon',
    retailer: 'target',
    identifier: '89123849',
    msrp: 26.94,
    marketPrice: 38.50,
    volume24h: '1,420 sales',
    demand: 'moderate',
    lastUpdated: Date.now(),
    notes: 'Steady restock target on Target & Walmart.',
  },
  {
    id: 'poke-paldean-etb',
    name: 'Paldean Fates Elite Trainer Box',
    setOrSeries: 'Special Paldean Fates',
    category: 'pokemon',
    retailer: 'target',
    identifier: '89045123',
    msrp: 54.99,
    marketPrice: 76.00,
    volume24h: '1,980 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Shiny Charizard ex Special Illustration Rare chase.',
  },
  {
    id: 'poke-paldean-bundle',
    name: 'Paldean Fates Booster Bundle (6 Packs)',
    setOrSeries: 'Special Paldean Fates',
    category: 'pokemon',
    retailer: 'amazon',
    identifier: 'B0CMZP6P9B',
    msrp: 26.94,
    marketPrice: 45.00,
    volume24h: '2,650 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'High resale velocity on Amazon & TCGPlayer.',
  },
  {
    id: 'poke-151-bundle',
    name: 'Pokémon 151 Booster Bundle (6 Packs)',
    setOrSeries: 'Scarlet & Violet 151',
    category: 'pokemon',
    retailer: 'bestbuy',
    identifier: '6548485',
    msrp: 28.99,
    marketPrice: 49.00,
    volume24h: '3,200 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Classic Kanto set. Massive demand on Best Buy & Target restocks.',
  },
  {
    id: 'poke-151-upc',
    name: 'Pokémon 151 Ultra Premium Collection',
    setOrSeries: 'Scarlet & Violet 151',
    category: 'pokemon',
    retailer: 'bestbuy',
    identifier: '6548484',
    msrp: 119.99,
    marketPrice: 172.00,
    volume24h: '940 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Mew metal card + Mewtwo illustration promo + 16 packs.',
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
    volume24h: '1,420 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Includes 14 Crown Zenith booster packs + Rayquaza promos.',
  },
  {
    id: 'poke-evolving-skies-bb',
    name: 'Evolving Skies Booster Box (36 Packs)',
    setOrSeries: 'Sword & Shield Evolving Skies',
    category: 'pokemon',
    retailer: 'amazon',
    identifier: 'B098R6M45N',
    msrp: 143.64,
    marketPrice: 780.00,
    volume24h: '190 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Grail modern set with Umbreon VMAX Alt Art (Moonbreon).',
  },

  // ==========================================
  // ONE PIECE CARD GAME — LATEST EXPANSIONS
  // ==========================================
  {
    id: 'op-09-box',
    name: 'One Piece OP-09 The Four Emperors Booster Box',
    setOrSeries: 'One Piece Card Game (OP-09)',
    category: 'onepiece',
    retailer: 'amazon',
    identifier: 'B0DG2K9YPQ',
    msrp: 107.76,
    marketPrice: 198.00,
    volume24h: '840 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Shanks, Blackbeard, Buggy, and Luffy Emperor chase cards.',
  },
  {
    id: 'op-08-box',
    name: 'One Piece OP-08 Two Legends Booster Box',
    setOrSeries: 'One Piece Card Game (OP-08)',
    category: 'onepiece',
    retailer: 'amazon',
    identifier: 'B0DCY7T6X1',
    msrp: 107.76,
    marketPrice: 159.00,
    volume24h: '620 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Silvers Rayleigh & Edward Newgate Whitebeard themed expansion.',
  },
  {
    id: 'op-07-box',
    name: 'One Piece OP-07 500 Years in the Future Booster Box',
    setOrSeries: 'One Piece Card Game (OP-07)',
    category: 'onepiece',
    retailer: 'amazon',
    identifier: 'B0DAK7V8N2',
    msrp: 107.76,
    marketPrice: 144.00,
    volume24h: '510 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Egghead Arc characters, Dr. Vegapunk, and Manga Boa Hancock.',
  },
  {
    id: 'op-06-box',
    name: 'One Piece OP-06 Wings of the Captain Booster Box',
    setOrSeries: 'One Piece Card Game (OP-06)',
    category: 'onepiece',
    retailer: 'amazon',
    identifier: 'B0CPN8L8W8',
    msrp: 107.76,
    marketPrice: 188.00,
    volume24h: '730 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Features Zoro & Sanji leaders + Manga Zoro secret rare.',
  },
  {
    id: 'op-05-box',
    name: 'One Piece OP-05 Awakening of the New Era Booster Box',
    setOrSeries: 'One Piece Card Game (OP-05)',
    category: 'onepiece',
    retailer: 'amazon',
    identifier: 'B0CBRYJ6F6',
    msrp: 107.76,
    marketPrice: 224.00,
    volume24h: '910 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Manga Gear 5 Luffy chase card makes this box legendary.',
  },
  {
    id: 'op-prb01-box',
    name: 'One Piece PRB-01 The Best Premium Booster Box',
    setOrSeries: 'PRB-01 Premium Reprint',
    category: 'onepiece',
    retailer: 'bestbuy',
    identifier: '6589312',
    msrp: 119.99,
    marketPrice: 212.00,
    volume24h: '1,150 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Top-tier reprint set with holographic DON! cards and Gold Manga prints.',
  },
  {
    id: 'op-eb01-box',
    name: 'One Piece EB-01 Memorial Collection Booster Box',
    setOrSeries: 'Extra Booster EB-01',
    category: 'onepiece',
    retailer: 'amazon',
    identifier: 'B0CH8N6B2W',
    msrp: 89.99,
    marketPrice: 139.00,
    volume24h: '430 sales',
    demand: 'moderate',
    lastUpdated: Date.now(),
    notes: 'Features Chopper Manga card and popular side-story characters.',
  },

  // ==========================================
  // SPORTS CARDS (NFL, MLB, NBA)
  // ==========================================
  {
    id: 'sports-prizm-fb-mega',
    name: '2024 Panini Prizm Football Mega Box',
    setOrSeries: 'Panini Prizm NFL 2024',
    category: 'sports',
    retailer: 'target',
    identifier: '89412389',
    msrp: 59.99,
    marketPrice: 138.00,
    volume24h: '2,100 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Caleb Williams & Jayden Daniels rookie Silver & Neon Green Prizms.',
  },
  {
    id: 'sports-prizm-fb-blaster',
    name: '2024 Panini Prizm Football Blaster Box',
    setOrSeries: 'Panini Prizm NFL 2024',
    category: 'sports',
    retailer: 'walmart',
    identifier: '98124512',
    msrp: 29.98,
    marketPrice: 66.00,
    volume24h: '2,450 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Laser Prizm parallels. Constant instantaneous sellouts.',
  },
  {
    id: 'sports-absolute-mega',
    name: '2024 Panini Absolute Football Mega Box',
    setOrSeries: 'Panini Absolute NFL 2024',
    category: 'sports',
    retailer: 'target',
    identifier: '89312984',
    msrp: 69.99,
    marketPrice: 175.00,
    volume24h: '1,620 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Ultra-rare Kaboom! and Explosive case hit inserts.',
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
  {
    id: 'sports-select-bball-mega',
    name: '2023-24 Panini Select Basketball Mega Box',
    setOrSeries: 'Panini Select NBA 2023-24',
    category: 'sports',
    retailer: 'target',
    identifier: '89123049',
    msrp: 59.99,
    marketPrice: 118.00,
    volume24h: '1,120 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Victor Wembanyama rookie card chase driving strong resale spread.',
  },

  // ==========================================
  // PC HARDWARE & GPUS
  // ==========================================
  {
    id: 'gpu-rtx-5090-fe',
    name: 'NVIDIA GeForce RTX 5090 32GB Founders Edition',
    setOrSeries: 'Blackwell RTX 50 Series',
    category: 'gaming',
    retailer: 'bestbuy',
    identifier: '6614151',
    msrp: 1999.99,
    marketPrice: 2890.00,
    volume24h: '380 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Flagship Blackwell GPU. Extreme spread ($890/unit). Best Buy drops.',
  },
  {
    id: 'gpu-rtx-5080-fe',
    name: 'NVIDIA GeForce RTX 5080 16GB Founders Edition',
    setOrSeries: 'Blackwell RTX 50 Series',
    category: 'gaming',
    retailer: 'bestbuy',
    identifier: '6614152',
    msrp: 999.99,
    marketPrice: 1440.00,
    volume24h: '510 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Strong resale demand with ~$440 profit spread per unit.',
  },
  {
    id: 'gpu-rtx-5070ti-fe',
    name: 'NVIDIA GeForce RTX 5070 Ti 16GB Founders Edition',
    setOrSeries: 'Blackwell RTX 50 Series',
    category: 'gaming',
    retailer: 'bestbuy',
    identifier: '6614153',
    msrp: 749.99,
    marketPrice: 1025.00,
    volume24h: '420 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'Mid-range Blackwell architecture with GDDR7 memory.',
  },
  {
    id: 'cpu-9800x3d',
    name: 'AMD Ryzen 7 9800X3D Gaming Processor',
    setOrSeries: 'Zen 5 3D V-Cache',
    category: 'gaming',
    retailer: 'amazon',
    identifier: 'B0DF6K9Y9R',
    msrp: 479.00,
    marketPrice: 685.00,
    volume24h: '1,850 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Number 1 gaming CPU worldwide. Daily rapid restocks on Amazon & Best Buy.',
  },
  {
    id: 'cpu-9950x3d',
    name: 'AMD Ryzen 9 9950X3D Processor',
    setOrSeries: 'Zen 5 3D V-Cache Flagship',
    category: 'gaming',
    retailer: 'amazon',
    identifier: 'B0DF6K9Y9S',
    msrp: 699.99,
    marketPrice: 899.00,
    volume24h: '390 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: '16-core flagship with dual 3D V-Cache.',
  },

  // ==========================================
  // CONSOLES & HANDHELDS
  // ==========================================
  {
    id: 'console-ps5-pro-30th',
    name: 'PlayStation 5 Pro 30th Anniversary Limited Bundle',
    setOrSeries: 'PlayStation 30th Anniversary Collection',
    category: 'consoles',
    retailer: 'bestbuy',
    identifier: '6601421',
    msrp: 999.99,
    marketPrice: 2350.00,
    volume24h: '120 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Individually numbered retro grey collectors edition.',
  },
  {
    id: 'console-ps5-pro',
    name: 'Sony PlayStation 5 Pro Console',
    setOrSeries: 'PlayStation 5 Generation',
    category: 'consoles',
    retailer: 'amazon',
    identifier: 'B0DFW6ZFWF',
    msrp: 699.99,
    marketPrice: 795.00,
    volume24h: '740 sales',
    demand: 'moderate',
    lastUpdated: Date.now(),
    notes: 'PSSR AI upscaling 2TB console.',
  },
  {
    id: 'console-ps-portal-30th',
    name: 'PlayStation Portal 30th Anniversary Edition',
    setOrSeries: 'PlayStation 30th Anniversary Collection',
    category: 'consoles',
    retailer: 'target',
    identifier: '89412981',
    msrp: 219.99,
    marketPrice: 395.00,
    volume24h: '410 sales',
    demand: 'ultra_high',
    lastUpdated: Date.now(),
    notes: 'Classic PS1 grey colorway remote player.',
  },
  {
    id: 'console-ps-portal-black',
    name: 'PlayStation Portal Remote Player (Midnight Black)',
    setOrSeries: 'PlayStation Accessories',
    category: 'consoles',
    retailer: 'amazon',
    identifier: 'B0DHW9Y7T1',
    msrp: 199.99,
    marketPrice: 245.00,
    volume24h: '680 sales',
    demand: 'high',
    lastUpdated: Date.now(),
    notes: 'New matte black edition remote player.',
  },
  {
    id: 'console-switch-oled-sv',
    name: 'Nintendo Switch OLED Pokémon Scarlet & Violet Edition',
    setOrSeries: 'Nintendo Switch OLED',
    category: 'consoles',
    retailer: 'amazon',
    identifier: 'B0BDVBRGWW',
    msrp: 359.99,
    marketPrice: 425.00,
    volume24h: '390 sales',
    demand: 'moderate',
    lastUpdated: Date.now(),
    notes: 'Koraidon & Miraidon glossy backplate art.',
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
  const customItems = getCustomMarketItems();

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

  // Combine custom items (top priority) with seeded items
  const combined = [...customItems, ...cachedItems];

  let totalRoi = 0;
  let topItem = combined[0] || null;
  let maxProfit = 0;
  let ultraHighCount = 0;

  for (const item of combined) {
    const profit = item.marketPrice - item.msrp;
    // Safeguard against $0 MSRP glitch items to avoid division by zero (Infinity)
    const roi = item.msrp > 0 
      ? (profit / item.msrp) * 100 
      : (item.marketPrice > 0 ? 100 : 0);

    if (Number.isFinite(roi)) {
      totalRoi += roi;
    }

    if (profit > maxProfit || !topItem) {
      maxProfit = profit;
      topItem = item;
    }

    if (item.demand === 'ultra_high') {
      ultraHighCount++;
    }
  }

  const averageRoi = combined.length > 0 ? Math.round(totalRoi / combined.length) : 0;

  return {
    items: combined,
    metrics: {
      totalTracked: combined.length,
      averageRoi: Number.isFinite(averageRoi) ? averageRoi : 0,
      topItem: topItem || {
        id: 'default-top',
        name: 'No active items',
        setOrSeries: 'General',
        category: 'pokemon',
        retailer: 'amazon',
        identifier: '0',
        msrp: 0,
        marketPrice: 0,
        volume24h: '0 sales',
        demand: 'moderate',
        lastUpdated: Date.now(),
      },
      ultraHighCount,
      lastUpdated: lastFetchEpoch,
    },
  };
}

