import electron from 'electron';
const { contextBridge, ipcRenderer } = electron;
import {
  TaskItem,
  BillingProfile,
  ProxyPool,
  ProxyItem,
  RetailAccount,
  TwoFactorRequest,
  FreebiesConfig,
  AmazonFreebieItem,
} from '../src/types';

contextBridge.exposeInMainWorld('blankBotAPI', {
  // Local Cryptography (AES-256-GCM)
  encrypt: (text: string, passphrase?: string) =>
    ipcRenderer.invoke('crypto:encrypt', text, passphrase),
  decrypt: (payload: string, passphrase?: string) =>
    ipcRenderer.invoke('crypto:decrypt', payload, passphrase),

  // Task Engine
  startTask: (
    task: TaskItem,
    profile: BillingProfile,
    proxyPool?: ProxyPool,
    account?: RetailAccount
  ) => ipcRenderer.invoke('tasks:start', task, profile, proxyPool, account),
  stopTask: (taskId: string) => ipcRenderer.invoke('tasks:stop', taskId),
  massStartTasks: (taskIds: string[]) => ipcRenderer.invoke('tasks:mass-start', taskIds),
  massStopTasks: (taskIds: string[]) => ipcRenderer.invoke('tasks:mass-stop', taskIds),
  onTaskUpdate: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('tasks:update', handler);
    return () => ipcRenderer.removeListener('tasks:update', handler);
  },

  // 2FA & IMAP Management
  submit2FACode: (requestId: string, code: string) =>
    ipcRenderer.invoke('imap:submit-code', requestId, code),
  on2FARequest: (callback: (request: TwoFactorRequest) => void) => {
    const handler = (_: any, data: TwoFactorRequest) => callback(data);
    ipcRenderer.on('imap:2fa-request', handler);
    return () => ipcRenderer.removeListener('imap:2fa-request', handler);
  },
  getIMAPStatus: () => ipcRenderer.invoke('imap:get-status'),
  connectIMAP: (config: any) => ipcRenderer.invoke('imap:connect', config),

  // Proxy Benchmarking
  testProxy: (proxy: ProxyItem, targetUrl?: string) =>
    ipcRenderer.invoke('proxies:test', proxy, targetUrl),
  testProxyPool: (poolId: string, proxies: ProxyItem[], targetUrl?: string) =>
    ipcRenderer.invoke('proxies:test-pool', poolId, proxies, targetUrl),

  // Anti-Bot & Captcha
  requestSensorToken: (retailer: string) =>
    ipcRenderer.invoke('antibot:sensor-token', retailer),
  solvePerimeterX: (url: string, pxPayload: any) =>
    ipcRenderer.invoke('antibot:solve-px', url, pxPayload),
  testAutoSolve: (apiKey?: string, accessToken?: string) =>
    ipcRenderer.invoke('aycd:test-connection', { apiKey, accessToken }),
  getAutoSolveStatus: () =>
    ipcRenderer.invoke('aycd:get-status'),
  solveWithAutoSolve: (request: any) =>
    ipcRenderer.invoke('aycd:solve', request),

  // Discord & Audio
  sendDiscordWebhook: (url: string, payload: any) =>
    ipcRenderer.invoke('integrations:discord-webhook', url, payload),
  playAlertSound: (type?: 'success' | 'fail', customPath?: string) =>
    ipcRenderer.invoke('integrations:play-sound', type, customPath),

  // Encrypted State Portability & Native Disk Persistence
  exportBackup: (payload: string) => ipcRenderer.invoke('storage:export', payload),
  importBackup: () => ipcRenderer.invoke('storage:import'),
  saveSettings: (settings: any) => ipcRenderer.invoke('storage:save-settings', settings),
  getSettings: () => ipcRenderer.invoke('storage:get-settings'),
  saveCheckouts: (checkouts: any[]) => ipcRenderer.invoke('storage:save-checkouts', checkouts),
  getCheckouts: () => ipcRenderer.invoke('storage:get-checkouts'),
  setStoreItem: (key: string, data: any) => ipcRenderer.invoke('storage:set-item', key, data),
  getStoreItem: (key: string) => ipcRenderer.invoke('storage:get-item', key),

  // Amazon Freebies Sniper
  startFreebiesSniper: (config: FreebiesConfig) =>
    ipcRenderer.invoke('freebies:start', config),
  stopFreebiesSniper: () => ipcRenderer.invoke('freebies:stop'),
  fetchLiveAmazonDeals: () => ipcRenderer.invoke('freebies:fetch-live-deals'),
  onFreebieDetected: (callback: (item: AmazonFreebieItem) => void) => {
    const handler = (_: any, data: AmazonFreebieItem) => callback(data);
    ipcRenderer.on('freebies:detected', handler);
    return () => ipcRenderer.removeListener('freebies:detected', handler);
  },

  // Shell External Browser Launcher
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),

  // Captcha Harvester Windows
  openCaptchaHarvester: (options: { id: string; targetUrl?: string; proxy?: string }) =>
    ipcRenderer.invoke('harvester:open', options),
  closeCaptchaHarvester: (id: string) =>
    ipcRenderer.invoke('harvester:close', id),
  getHarvesterStatus: (id: string) =>
    ipcRenderer.invoke('harvester:status', id),
});
