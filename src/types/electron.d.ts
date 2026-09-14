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
  AppSettings
} from './index';

export interface BlankBotAPI {
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

  // External Browser Dispatcher
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    blankBotAPI?: BlankBotAPI;
  }
}
