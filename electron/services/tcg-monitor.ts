import { EventEmitter } from 'events';
import { gotScraping } from 'got-scraping';
import { TcgMonitorConfig, TcgRestockEvent, Retailer } from '../../src/types';

interface TrackedTcgTarget {
  id: string;
  name: string;
  setOrSeries: string;
  retailer: Retailer;
  identifier: string; // SKU / ASIN / TCIN / URL
  price: number;
  marketPrice?: number;
  productUrl: string;
  imageUrl?: string;
  knownStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';
}

// Built-in seed tracking catalog across major retailers (Focus on high-demand Pokémon / One Piece)
export const DEFAULT_TCG_TARGETS: Omit<TrackedTcgTarget, 'knownStatus'>[] = [
  {
    id: 'tcg_chaos_bb_bby',
    name: 'Pokémon: Chaos Rising Booster Box (36 Packs)',
    setOrSeries: 'Mega Evolution: Chaos Rising (ME04)',
    retailer: 'bestbuy',
    identifier: '6618921',
    price: 161.64,
    marketPrice: 289.00,
    productUrl: 'https://www.bestbuy.com/site/pokemon-trading-card-game-chaos-rising-booster-box/6618921.p',
    imageUrl: 'https://images.pokemontcg.io/me04/logo.png',
  },
  {
    id: 'tcg_chaos_etb_bby',
    name: 'Pokémon: Chaos Rising Elite Trainer Box (ETB)',
    setOrSeries: 'Mega Evolution: Chaos Rising (ME04)',
    retailer: 'bestbuy',
    identifier: '6618925',
    price: 59.99,
    marketPrice: 94.99,
    productUrl: 'https://www.bestbuy.com/site/pokemon-trading-card-game-chaos-rising-elite-trainer-box/6618925.p',
    imageUrl: 'https://images.pokemontcg.io/me04/symbol.png',
  },
  {
    id: 'tcg_destined_bb_tgt',
    name: 'Pokémon: Destined Rivals Booster Bundle (6 Packs)',
    setOrSeries: 'Scarlet & Violet: Destined Rivals (SV10)',
    retailer: 'target',
    identifier: '90184421',
    price: 26.94,
    marketPrice: 48.00,
    productUrl: 'https://www.target.com/p/pokemon-tcg-destined-rivals-booster-bundle/-/A-90184421',
  },
  {
    id: 'tcg_journey_etb_wm',
    name: 'Pokémon: Journey Together Elite Trainer Box',
    setOrSeries: 'Scarlet & Violet: Journey Together (SV09)',
    retailer: 'walmart',
    identifier: '548910283',
    price: 54.98,
    marketPrice: 85.00,
    productUrl: 'https://www.walmart.com/ip/Pokemon-TCG-Journey-Together-Elite-Trainer-Box/548910283',
  },
  {
    id: 'tcg_prismatic_bundle_amz',
    name: 'Pokémon: Prismatic Evolutions Booster Bundle',
    setOrSeries: 'Special: Prismatic Evolutions (SV08.5)',
    retailer: 'amazon',
    identifier: 'B0DNM4819X',
    price: 26.94,
    marketPrice: 62.00,
    productUrl: 'https://www.amazon.com/dp/B0DNM4819X',
  },
  {
    id: 'tcg_op10_bb_amz',
    name: 'One Piece Card Game: The Azure Emperor Booster Box [OP-10]',
    setOrSeries: 'One Piece Card Game [OP-10]',
    retailer: 'amazon',
    identifier: 'B0DQ8917ZY',
    price: 107.76,
    marketPrice: 195.00,
    productUrl: 'https://www.amazon.com/dp/B0DQ8917ZY',
  },
  {
    id: 'tcg_op09_bb_tgt',
    name: 'One Piece Card Game: Emperors in the New World [OP-09]',
    setOrSeries: 'One Piece Card Game [OP-09]',
    retailer: 'target',
    identifier: '89912034',
    price: 107.76,
    marketPrice: 175.00,
    productUrl: 'https://www.target.com/p/one-piece-card-game-op-09/-/A-89912034',
  },
];

export class TcgDropMonitor extends EventEmitter {
  private isRunning: boolean = false;
  private config: TcgMonitorConfig | null = null;
  private timer: NodeJS.Timeout | null = null;
  private targets: Map<string, TrackedTcgTarget> = new Map();
  private lastRestockTimes: Map<string, number> = new Map();

  constructor() {
    super();
    // Initialize targets
    for (const t of DEFAULT_TCG_TARGETS) {
      this.targets.set(t.id, { ...t, knownStatus: 'UNKNOWN' });
    }
  }

  public start(config: TcgMonitorConfig): boolean {
    this.config = config;
    this.isRunning = true;
    this.emit('status', { isRunning: true, trackedCount: this.targets.size });
    this.pollLoop();
    return true;
  }

  public stop(): boolean {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.emit('status', { isRunning: false, trackedCount: this.targets.size });
    return true;
  }

  public getStatus(): { isRunning: boolean; trackedCount: number } {
    return {
      isRunning: this.isRunning,
      trackedCount: this.targets.size,
    };
  }

  private async pollLoop(): Promise<void> {
    if (!this.isRunning || !this.config) return;

    try {
      await this.scanAllTargets();
    } catch (err: any) {
      console.warn('TCG Drop Monitor poll error:', err.message);
    }

    if (this.isRunning) {
      const interval = Math.max(8000, this.config?.pollIntervalMs || 20000);
      this.timer = setTimeout(() => this.pollLoop(), interval);
    }
  }

  private async scanAllTargets(): Promise<void> {
    if (!this.config) return;

    for (const [id, target] of this.targets.entries()) {
      if (!this.isRunning) break;

      // Filter by enabled retailers
      if (this.config.retailers?.length && !this.config.retailers.includes(target.retailer)) {
        continue;
      }

      // Keyword filtering
      if (!this.matchesKeywordFilter(target.name)) {
        continue;
      }

      try {
        const inStock = await this.checkInventory(target);
        const previousStatus = target.knownStatus;
        target.knownStatus = inStock ? 'IN_STOCK' : 'OUT_OF_STOCK';

        // Restock Event detected! (OOS -> In-Stock, or first detection if in stock)
        if (inStock && previousStatus !== 'IN_STOCK') {
          const now = Date.now();
          const lastAlert = this.lastRestockTimes.get(id) || 0;

          // Cooldown 2 minutes per product to prevent spamming
          if (now - lastAlert > 120000) {
            this.lastRestockTimes.set(id, now);
            const event: TcgRestockEvent = {
              id: `rst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              productName: target.name,
              setOrSeries: target.setOrSeries,
              retailer: target.retailer,
              identifier: target.identifier,
              price: target.price,
              marketPrice: target.marketPrice,
              productUrl: target.productUrl,
              imageUrl: target.imageUrl,
              timestamp: now,
              status: 'IN_STOCK',
              isDirectDrop: true,
            };

            this.emit('restock_detected', event);

            // Dispatch Discord Webhook if configured
            if (this.config.discordWebhookUrl) {
              await sendTcgRestockWebhook(this.config.discordWebhookUrl, event);
            }
          }
        }
      } catch (err: any) {
        // Log & proceed to next target
      }

      // Brief delay between target checks to distribute network traffic
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  private async checkInventory(target: TrackedTcgTarget): Promise<boolean> {
    switch (target.retailer) {
      case 'bestbuy': {
        try {
          const res = await gotScraping.get(
            `https://www.bestbuy.com/api/3.0/priceBlocks?skus=${encodeURIComponent(target.identifier)}`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              },
              timeout: { request: 5000 },
              responseType: 'json',
            }
          );
          const data: any = res.body;
          const buttonState = data?.[0]?.buttonState?.buttonState;
          return buttonState === 'ADD_TO_CART';
        } catch {
          return false;
        }
      }

      case 'target': {
        try {
          const res = await gotScraping.get(
            `https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&tcin=${encodeURIComponent(target.identifier)}&pricing_store_id=3991`,
            {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
              timeout: { request: 5000 },
              responseType: 'json',
            }
          );
          const data: any = res.body;
          const status = data?.data?.product?.fulfillment?.shipping_options?.availability_status;
          return status === 'IN_STOCK';
        } catch {
          return false;
        }
      }

      default: {
        // Generic stock query or simulation
        return false;
      }
    }
  }

  private matchesKeywordFilter(name: string): boolean {
    if (!this.config) return true;
    const lower = name.toLowerCase();

    // Positive filter: Must match at least one keyword if positive list is provided
    if (this.config.positiveKeywords?.length) {
      const matchesPos = this.config.positiveKeywords.some(
        (kw) => kw.trim() && lower.includes(kw.toLowerCase().trim())
      );
      if (!matchesPos) return false;
    }

    // Negative filter: Must NOT match any negative keywords
    if (this.config.negativeKeywords?.length) {
      const matchesNeg = this.config.negativeKeywords.some(
        (kw) => kw.trim() && lower.includes(kw.toLowerCase().trim())
      );
      if (matchesNeg) return false;
    }

    return true;
  }
}

export async function sendTcgRestockWebhook(
  webhookUrl: string,
  event: TcgRestockEvent
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

  const profitSpread = event.marketPrice && event.marketPrice > event.price
    ? event.marketPrice - event.price
    : 0;

  const embed = {
    title: `⚡ TCG DROP DETECTED: ${event.productName}`,
    url: event.productUrl,
    description: `A live restock was detected for **${event.setOrSeries}**! Available now at **${event.retailer.toUpperCase()}**.\n\n[👉 Direct Store Product Link](${event.productUrl})`,
    color: 0x00f0ff, // Neon Cyan / Electric Blue
    thumbnail: event.imageUrl ? { url: event.imageUrl } : undefined,
    fields: [
      { name: '🛒 Retailer', value: `\`${event.retailer.toUpperCase()}\``, inline: true },
      { name: '💵 Retail MSRP', value: `\`$${event.price.toFixed(2)}\``, inline: true },
      {
        name: '📈 Market Value',
        value: event.marketPrice ? `\`$${event.marketPrice.toFixed(2)}\` (+${((profitSpread / event.price) * 100).toFixed(0)}%)` : 'High Demand',
        inline: true,
      },
      { name: '🏷️ SKU / ID', value: `\`${event.identifier}\``, inline: true },
      { name: '📦 Est. Profit Spread', value: profitSpread > 0 ? `\`+$${profitSpread.toFixed(2)}\`` : 'Collect / Hold', inline: true },
      { name: '🚀 Quick-Task Command', value: `\`${event.productUrl}\``, inline: false },
    ],
    footer: {
      text: 'Blank Bot • 24/7 TCG Drop Radar & Restock Sentinel',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await gotScraping.post(webhookUrl, {
      json: {
        username: 'Blank TCG Radar',
        avatar_url: 'https://raw.githubusercontent.com/blank-bot/assets/main/logo.png',
        embeds: [embed],
      },
      timeout: { request: 6000 },
      throwHttpErrors: false,
    });
    return res.statusCode >= 200 && res.statusCode < 300;
  } catch (err: any) {
    console.error('Failed to send TCG Discord webhook:', err.message);
    return false;
  }
}

export const tcgDropMonitor = new TcgDropMonitor();
