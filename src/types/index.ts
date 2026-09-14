export type Retailer = 'bestbuy' | 'walmart' | 'target' | 'amazon' | 'apple';

export type TaskStatus =
  | 'IDLE'
  | 'MONITORING'
  | 'WAITING_FOR_DROP'
  | 'QUEUE'
  | 'CARTING'
  | 'WAITING_2FA'
  | 'CHECKING_OUT'
  | 'SUCCESS'
  | 'FAILED'
  | 'STOPPED';

export interface TaskLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface TaskFlags {
  skipMonitor: boolean;
  loopCheckout: boolean;
  autoStartOnRestart: boolean;
}

export interface TaskItem {
  id: string;
  groupId: string;
  retailer: Retailer;
  input: string; // SKU, URL, or comma-separated multi-SKU
  monitorDelay: number; // default 3500ms
  retryDelay: number; // default 2000ms
  profileId: string;
  proxyPoolId: string;
  accountId?: string;
  status: TaskStatus;
  statusMessage: string;
  checkoutLatency?: number; // ms
  flags: TaskFlags;
  scheduledStartEpoch?: number; // epoch ms
  scheduledStopEpoch?: number; // epoch ms
  orderId?: string;
  logs: TaskLogEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface TaskGroup {
  id: string;
  name: string;
  retailer: Retailer;
  createdAt: number;
}

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EncryptedPaymentInfo {
  cardholderName: string;
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover';
  panEncrypted: string; // AES-256-GCM ciphertext:iv:tag
  expMonth: string;
  expYear: string;
  cvvEncrypted: string; // AES-256-GCM ciphertext:iv:tag
  maskedPan: string; // e.g. "•••• •••• •••• 4242"
}

export interface BillingProfile {
  id: string;
  profileName: string;
  email: string;
  phone: string;
  shippingAddress: Address;
  billingAddress: Address;
  sameAsShipping: boolean;
  payment: EncryptedPaymentInfo;
  createdAt: number;
  updatedAt: number;
}

export type ProxyProtocol = 'http' | 'https' | 'socks5';
export type ProxyTier = 'MONITOR_ISP' | 'CHECKOUT_RESI';

export interface ProxyItem {
  id: string;
  raw: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: ProxyProtocol;
  latencyMs?: number;
  status: 'active' | 'dead' | 'untested';
}

export interface ProxyPool {
  id: string;
  name: string;
  tier: ProxyTier;
  proxies: ProxyItem[];
  createdAt: number;
}

export interface RetailAccount {
  id: string;
  retailer: Retailer;
  email: string;
  passwordEncrypted: string;
  status: 'active' | 'flagged' | '2fa_required';
  sessionCookieEncrypted?: string;
  createdAt: number;
}

export interface TwoFactorRequest {
  id: string;
  taskId: string;
  retailer: Retailer;
  email: string;
  code?: string;
  timestamp: number;
  status: 'pending' | 'resolved' | 'expired';
}

export interface AmazonFreebieItem {
  id: string;
  asin: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category?: string;
  dealType?: string;
  seller?: string;
  dealUrl: string;
  detectedAt: number;
  status: 'detected' | 'ordered' | 'blacklisted' | 'filtered';
}

export interface FreebiesConfig {
  enabled: boolean;
  maxPrice: number; // usually $0.00
  autoOrder: boolean;
  blacklistKeywords: string[];
  blacklistAsins: string[];
  proxyPoolId: string;
  profileId: string;
}

export interface SolverKeys {
  twoCaptcha?: string;
  capSolver?: string;
  antiCaptcha?: string;
  aycdApiKey?: string;
  aycdAccessToken?: string;
  aycdAutoRoute?: boolean;
}

export type ThemeId =
  | 'oled'
  | 'midnight'
  | 'obsidian'
  | 'carbon'
  | 'dracula'
  | 'nord'
  | 'emerald'
  | 'crimson'
  | 'titanium'
  | 'sunset'
  | 'synthwave'
  | 'tokyo'
  | 'amethyst'
  | 'volt'
  | 'phantom'
  | 'matcha'
  | 'solar'
  | 'custom';

export type SoundPackId =
  | 'refract_cyan'
  | 'laser_ping'
  | 'retro_arcade'
  | 'sub_thud'
  | 'mechanical_click'
  | 'mute';

export interface CaptchaHarvesterSlot {
  id: string;
  name: string;
  target: 'google' | 'youtube' | 'recaptcha' | 'turnstile' | 'hcaptcha';
  proxy?: string;
  isOpen: boolean;
  tokensHarvested: number;
}

export type MarketCategory = 'pokemon' | 'onepiece' | 'sports' | 'gaming' | 'consoles';

export interface MarketItem {
  id: string;
  name: string;
  setOrSeries: string;
  category: MarketCategory;
  retailer: Retailer;
  identifier: string; // SKU or ASIN
  msrp: number;
  marketPrice: number;
  volume24h?: string;
  demand: 'ultra_high' | 'high' | 'moderate';
  lastUpdated: number;
  notes?: string;
  isCustom?: boolean;
}

export interface AppSettings {
  theme?: ThemeId;
  customThemeColors?: {
    primary: string;
    secondary: string;
  };
  soundPack?: SoundPackId;
  enableFreebiesSniper?: boolean;
  enableMarketAnalytics?: boolean;
  discordWebhookUrl: string;
  discordNotifyOnSuccess: boolean;
  discordNotifyOnDecline: boolean;
  enableRemoteControl?: boolean;
  playSoundOnSuccess: boolean;
  customSoundPath?: string;
  encryptionPassphrase: string;
  solverKeys: SolverKeys;
  defaultMonitorDelay: number;
  defaultRetryDelay: number;
  autoSolvePX: boolean;
  shapeHarvestInterval: number; // seconds
}

export interface SystemStats {
  activeTasks: number;
  totalTasks: number;
  successCount: number;
  failedCount: number;
  imapStatus: 'connected' | 'disconnected' | 'connecting';
  activeProxies: number;
}
