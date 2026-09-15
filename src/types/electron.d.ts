import {
  TaskItem,
  BillingProfile,
  ProxyPool,
  ProxyItem,
  RetailAccount,
  TaskStatus,
  TaskLogEntry,
  TwoFactorRequest,
  AmazonFreebieItem,
  FreebiesConfig,
  TcgRestockEvent,
  TcgMonitorConfig,
  AppSettings,
  NetworkStatus
} from './index';

export interface BlankBotAPI {
  // Live WAN Internet Connectivity Sentinel
  checkInternet: () => Promise<NetworkStatus>;
  getInternetStatus: () => Promise<NetworkStatus>;
  onNetworkStatus: (callback: (status: NetworkStatus) => void) => () => void;

  // Local Cryptography
  encrypt: (text: string, passphrase?: string) => Promise<string>;
  decrypt: (payload: string, passphrase?: string) => Promise<string>;

  // Task Engine Operations
  startTask: (
    task: TaskItem,
    profile: BillingProfile,
    proxyPool?: ProxyPool,
    account?: RetailAccount
  ) => Promise<boolean>;
  stopTask: (taskId: string) => Promise<boolean>;
  massStartTasks: (taskIds: string[]) => Promise<boolean>;
  massStopTasks: (taskIds: string[]) => Promise<boolean>;
  onTaskUpdate: (
    callback: (data: {
      taskId: string;
      status: TaskStatus;
      message: string;
      latency?: number;
      log?: TaskLogEntry;
      orderId?: string;
    }) => void
  ) => () => void;

  // 2FA & IMAP Management
  submit2FACode: (requestId: string, code: string) => Promise<boolean>;
  on2FARequest: (callback: (request: TwoFactorRequest) => void) => () => void;
  getIMAPStatus: () => Promise<'connected' | 'disconnected' | 'connecting'>;
  connectIMAP: (config: {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
  }) => Promise<boolean>;

  // Proxy Benchmarking
  testProxy: (
    proxy: ProxyItem,
    targetUrl?: string
  ) => Promise<{ latencyMs: number; status: 'active' | 'dead' }>;
  testProxyPool: (
    poolId: string,
    proxies: ProxyItem[],
    targetUrl?: string
  ) => Promise<ProxyItem[]>;

  // Anti-Bot & Captcha
  requestSensorToken: (retailer: string) => Promise<string>;
  solvePerimeterX: (url: string, pxPayload: any) => Promise<string>;
  testAutoSolve: (
    apiKey?: string,
    accessToken?: string
  ) => Promise<{ success: boolean; message: string; connectedAt?: number; accountEmail?: string }>;
  getAutoSolveStatus: () => Promise<{ isConnected: boolean; hasCredentials: boolean }>;
  solveWithAutoSolve: (request: any) => Promise<string>;

  // Integrations (Discord, Audio)
  sendDiscordWebhook: (
    url: string,
    payload: {
      title: string;
      sku: string;
      retailer: string;
      price: string;
      profileName: string;
      maskedCard: string;
      latency: number;
      orderId?: string;
    }
  ) => Promise<boolean>;
  playAlertSound: (type?: 'success' | 'fail', customPath?: string) => Promise<void>;

  // Encrypted State Portability
  exportBackup: (payload: string) => Promise<{ success: boolean; filePath?: string }>;
  importBackup: () => Promise<{ success: boolean; data?: string }>;

  // Amazon Freebies Sniper
  startFreebiesSniper: (config: FreebiesConfig) => Promise<boolean>;
  stopFreebiesSniper: () => Promise<boolean>;
  fetchLiveAmazonDeals: () => Promise<AmazonFreebieItem[]>;
  onFreebieDetected: (callback: (item: AmazonFreebieItem) => void) => () => void;

  // 24/7 TCG Drop Radar & Restock Monitor
  startTcgMonitor: (config: TcgMonitorConfig, proxyPool?: ProxyPool) => Promise<boolean>;
  stopTcgMonitor: () => Promise<boolean>;
  getTcgMonitorStatus: () => Promise<{ isRunning: boolean; trackedCount: number }>;
  onTcgRestockDetected: (callback: (event: TcgRestockEvent) => void) => () => void;
  sendTcgDiscordWebhook: (url: string, event: TcgRestockEvent) => Promise<boolean>;
  triggerTcgManualScan: (config?: Partial<TcgMonitorConfig>, proxyPool?: ProxyPool) => Promise<TcgRestockEvent[]>;
  triggerTcgLocalStoreScan: (zipCode: string, radiusMiles: number, city?: string, state?: string, proxyPool?: ProxyPool) => Promise<TcgRestockEvent[]>;

  // External Browser Dispatcher
  openExternal: (url: string) => Promise<void>;

  // Captcha Harvester Windows
  openCaptchaHarvester: (options: {
    id: string;
    targetUrl?: string;
    proxy?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  closeCaptchaHarvester: (id: string) => Promise<{ success: boolean }>;
  getHarvesterStatus: (id: string) => Promise<{ isOpen: boolean }>;

  // Native Persistent File Storage (100% durable across restarts & updates)
  saveSettings: (settings: any) => Promise<{ success: boolean; message?: string }>;
  getSettings: () => Promise<any>;
  saveCheckouts: (checkouts: any[]) => Promise<{ success: boolean; message?: string }>;
  getCheckouts: () => Promise<any[]>;
  setStoreItem: (key: string, data: any) => Promise<{ success: boolean; message?: string }>;
  getStoreItem: (key: string) => Promise<any>;
}

declare global {
  interface Window {
    blankBotAPI?: BlankBotAPI;
  }
}
