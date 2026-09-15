import electron from 'electron';
const { app, BrowserWindow, ipcMain, Menu, shell, session } = electron;
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { encryptData, decryptData } from './crypto/cipher';
import { taskEngine } from './engine/task-engine';
import { imapWorker } from './services/imap-worker';
import { pingProxy, benchmarkProxyPool } from './services/proxy-tester';
import { antiBotEngine } from './services/antibot';
import { aycdService } from './services/aycd';
import { sendDiscordCheckoutWebhook } from './services/discord';
import { audioService } from './services/audio';
import { exportBackupToFile, importBackupFromFile } from './services/storage';
import { freebiesSniper, fetchLiveAmazonDeals } from './modules/amazon';
import { tcgDropMonitor, sendTcgRestockWebhook } from './services/tcg-monitor';
import { TaskItem, BillingProfile, ProxyPool, RetailAccount, FreebiesConfig, TcgMonitorConfig, TcgRestockEvent, ProxyItem } from '../src/types';

// Remove default File/Edit/View menu bar for clean, minimal UI
Menu.setApplicationMenu(null);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
const harvesterWindows = new Map<string, BrowserWindow>();

function createWindow(): void {
  const iconPath = path.join(__dirname, '../build/icon.png');
  const hasIcon = fs.existsSync(iconPath);

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 980,
    minHeight: 650,
    title: 'Blank — High-Frequency Retail Automation',
    icon: hasIcon ? iconPath : undefined,
    backgroundColor: '#080c14',
    show: false,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Open all external URLs in the user's default OS browser (Chrome/Edge/Firefox)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Guarantee window is shown even if ready-to-show was delayed
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 1000);

  // Intercept all window.open / target="_blank" links and route to OS default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Intercept any direct navigation away from the local app
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (
      url !== mainWindow?.webContents.getURL() &&
      !url.startsWith('http://localhost') &&
      !url.startsWith('file://')
    ) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Event forwarders to renderer
  taskEngine.on('task_update', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('tasks:update', data);
    }
  });

  taskEngine.on('2fa_required', (req) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('imap:2fa-request', req);
    }
  });

  freebiesSniper.on('freebie_detected', (deal) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('freebies:detected', deal);
    }
  });

  tcgDropMonitor.on('restock_detected', (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('tcg:restock-detected', event);
    }
  });

  const indexPath = path.join(app.getAppPath(), 'dist/index.html');
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL).catch(() => {
      mainWindow?.loadFile(indexPath);
    });
  } else if (!app.isPackaged && process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow?.loadFile(indexPath);
    });
  } else {
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers(): void {
  // Cryptography
  ipcMain.handle('crypto:encrypt', async (_, text: string, passphrase?: string) => {
    return encryptData(text, passphrase);
  });

  ipcMain.handle('crypto:decrypt', async (_, payload: string, passphrase?: string) => {
    return decryptData(payload, passphrase);
  });

  // Task Management
  ipcMain.handle(
    'tasks:start',
    async (
      _,
      task: TaskItem,
      profile: BillingProfile,
      proxyPool?: ProxyPool,
      account?: RetailAccount
    ) => {
      return taskEngine.startTask(task, profile, proxyPool, account);
    }
  );

  ipcMain.handle('tasks:stop', async (_, taskId: string) => {
    return taskEngine.stopTask(taskId);
  });

  ipcMain.handle('tasks:mass-stop', async (_, taskIds: string[]) => {
    return taskEngine.massStop(taskIds);
  });

  // 2FA / IMAP
  ipcMain.handle('imap:submit-code', async (_, requestId: string, code: string) => {
    return imapWorker.resolveManual2FA(requestId, code);
  });

  ipcMain.handle('imap:get-status', async () => {
    return imapWorker.getStatus();
  });

  ipcMain.handle('imap:connect', async (_, config: any) => {
    return imapWorker.connect(config);
  });

  // Proxies
  ipcMain.handle('proxies:test', async (_, proxy: ProxyItem, targetUrl?: string) => {
    return pingProxy(proxy, targetUrl);
  });

  ipcMain.handle(
    'proxies:test-pool',
    async (_, poolId: string, proxies: ProxyItem[], targetUrl?: string) => {
      return benchmarkProxyPool(proxies, targetUrl);
    }
  );

  // Anti-Bot & Captcha
  ipcMain.handle('antibot:sensor-token', async (_, retailer: string) => {
    if (retailer === 'target') {
      return antiBotEngine.getTargetShapeToken();
    }
    return '';
  });

  ipcMain.handle('antibot:solve-px', async (_, url: string) => {
    return antiBotEngine.solveWalmartPerimeterX(url);
  });

  // AYCD AutoSolve Integration
  ipcMain.handle(
    'aycd:test-connection',
    async (_, { apiKey, accessToken }: { apiKey?: string; accessToken?: string }) => {
      return aycdService.testConnection(apiKey, accessToken);
    }
  );

  ipcMain.handle('aycd:get-status', async () => {
    return aycdService.getStatus();
  });

  ipcMain.handle('aycd:solve', async (_, request: any) => {
    return aycdService.solveCaptcha(request);
  });

  // Discord & Audio
  ipcMain.handle('integrations:discord-webhook', async (_, url: string, payload: any) => {
    return sendDiscordCheckoutWebhook(url, payload);
  });

  ipcMain.handle('integrations:play-sound', async (_, type?: 'success' | 'fail', customPath?: string) => {
    return audioService.playAlertSound(type, customPath);
  });

  // Encrypted State Portability
  ipcMain.handle('storage:export', async (_, payload: string) => {
    return exportBackupToFile(payload, mainWindow || undefined);
  });

  ipcMain.handle('storage:import', async () => {
    return importBackupFromFile(mainWindow || undefined);
  });

  // Native File-System Storage (UserData JSON persistence)
  const getStoreDir = () => {
    const dir = path.join(app.getPath('userData'), 'store');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  };

  ipcMain.handle('storage:save-settings', async (_, newSettings: any) => {
    try {
      const filePath = path.join(app.getPath('userData'), 'blank_settings.json');
      fs.writeFileSync(filePath, JSON.stringify(newSettings, null, 2), 'utf-8');
      return { success: true };
    } catch (err: any) {
      console.error('Failed to save settings to disk:', err);
      return { success: false, message: err?.message };
    }
  });

  ipcMain.handle('storage:get-settings', async () => {
    try {
      const filePath = path.join(app.getPath('userData'), 'blank_settings.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
      return null;
    } catch (err) {
      console.error('Failed to read settings from disk:', err);
      return null;
    }
  });

  ipcMain.handle('storage:save-checkouts', async (_, checkouts: any[]) => {
    try {
      const filePath = path.join(app.getPath('userData'), 'blank_checkouts.json');
      fs.writeFileSync(filePath, JSON.stringify(checkouts, null, 2), 'utf-8');
      return { success: true };
    } catch (err: any) {
      console.error('Failed to save checkouts to disk:', err);
      return { success: false, message: err?.message };
    }
  });

  ipcMain.handle('storage:get-checkouts', async () => {
    try {
      const filePath = path.join(app.getPath('userData'), 'blank_checkouts.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
      return [];
    } catch (err) {
      console.error('Failed to read checkouts from disk:', err);
      return [];
    }
  });

  ipcMain.handle('storage:set-item', async (_, key: string, data: any) => {
    try {
      const dir = getStoreDir();
      const safeKey = String(key).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = path.join(dir, `${safeKey}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return { success: true };
    } catch (err: any) {
      console.error(`Failed to write store item ${key}:`, err);
      return { success: false, message: err?.message };
    }
  });

  ipcMain.handle('storage:get-item', async (_, key: string) => {
    try {
      const dir = getStoreDir();
      const safeKey = String(key).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = path.join(dir, `${safeKey}.json`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
      return null;
    } catch (err) {
      console.error(`Failed to read store item ${key}:`, err);
      return null;
    }
  });

  // Amazon Freebies Sniper
  ipcMain.handle('freebies:start', async (_, config: FreebiesConfig) => {
    return freebiesSniper.start(config);
  });

  ipcMain.handle('freebies:stop', async () => {
    return freebiesSniper.stop();
  });

  ipcMain.handle('freebies:fetch-live-deals', async () => {
    return fetchLiveAmazonDeals();
  });

  // 24/7 TCG Drop Radar & Restock Monitor
  ipcMain.handle('tcg-monitor:start', async (_, config: TcgMonitorConfig) => {
    return tcgDropMonitor.start(config);
  });

  ipcMain.handle('tcg-monitor:stop', async () => {
    return tcgDropMonitor.stop();
  });

  ipcMain.handle('tcg-monitor:get-status', async () => {
    return tcgDropMonitor.getStatus();
  });

  ipcMain.handle('tcg-monitor:send-webhook', async (_, url: string, event: TcgRestockEvent) => {
    return sendTcgRestockWebhook(url, event);
  });

  ipcMain.handle('tcg-monitor:manual-scan', async (_, customConfig?: Partial<TcgMonitorConfig>) => {
    return tcgDropMonitor.triggerManualScan(customConfig);
  });

  ipcMain.handle(
    'tcg-monitor:scan-local-stores',
    async (_, zipCode: string, radiusMiles: number, city?: string, state?: string) => {
      return tcgDropMonitor.triggerLocalStoreScan(zipCode, radiusMiles, city, state);
    }
  );

  // Shell External URL Dispatcher
  ipcMain.handle('shell:open-external', async (_, url: string) => {
    return shell.openExternal(url);
  });

  // Native Captcha Harvester Windows
  ipcMain.handle('harvester:open', async (_, { id, targetUrl, proxy }: { id: string; targetUrl?: string; proxy?: string }) => {
    try {
      if (harvesterWindows.has(id)) {
        const existing = harvesterWindows.get(id);
        if (existing && !existing.isDestroyed()) {
          existing.focus();
          if (targetUrl) existing.loadURL(targetUrl);
          return { success: true, message: 'Harvester focused' };
        }
      }

      const partitionName = `persist:harvester_${id}`;
      const sess = session.fromPartition(partitionName);

      if (proxy) {
        const proxyRule = proxy.includes('://') ? proxy : `http://${proxy}`;
        await sess.setProxy({ proxyRules: proxyRule });
      }

      const harvesterWin = new BrowserWindow({
        width: 480,
        height: 640,
        title: `Blank Harvester — Slot #${id}`,
        backgroundColor: '#ffffff',
        autoHideMenuBar: true,
        webPreferences: {
          session: sess,
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
        },
      });

      harvesterWin.setMenuBarVisibility(false);

      // Guarantee proper light background and high contrast text for captcha demo & challenge pages
      harvesterWin.webContents.on('did-finish-load', async () => {
        try {
          if (harvesterWin.isDestroyed()) return;
          const currentUrl = harvesterWin.webContents.getURL().toLowerCase();
          if (
            currentUrl.includes('recaptcha') ||
            currentUrl.includes('turnstile') ||
            currentUrl.includes('peet.ws') ||
            currentUrl.includes('hcaptcha')
          ) {
            await harvesterWin.webContents.insertCSS(`
              html, body {
                background-color: #ffffff !important;
                color: #111827 !important;
                color-scheme: light !important;
              }
              fieldset {
                border: 1px solid #d1d5db !important;
                padding: 14px !important;
                border-radius: 8px !important;
                margin-bottom: 12px !important;
              }
              legend {
                color: #111827 !important;
                font-weight: 600 !important;
                padding: 0 6px !important;
              }
              h1, h2, h3, h4, p, label, span, div {
                color: #111827 !important;
              }
              input[type="text"], input[type="email"], input[type="password"] {
                background-color: #ffffff !important;
                color: #111827 !important;
                border: 1px solid #9ca3af !important;
                border-radius: 6px !important;
                padding: 6px 10px !important;
                color-scheme: light !important;
              }
              input[type="submit"], button {
                background-color: #2563eb !important;
                color: #ffffff !important;
                border: none !important;
                border-radius: 6px !important;
                padding: 8px 16px !important;
                cursor: pointer !important;
                font-weight: 600 !important;
              }
              a {
                color: #0284c7 !important;
              }
            `);
          }
        } catch {
          // Window may have closed before injection
        }
      });

      const initialUrl = targetUrl || 'https://accounts.google.com';
      await harvesterWin.loadURL(initialUrl);

      harvesterWin.on('closed', () => {
        harvesterWindows.delete(id);
      });

      harvesterWindows.set(id, harvesterWin);
      return { success: true };
    } catch (err: any) {
      console.error('Harvester window error:', err);
      return { success: false, message: err?.message || 'Failed to open harvester' };
    }
  });

  ipcMain.handle('harvester:close', async (_, id: string) => {
    const existing = harvesterWindows.get(id);
    if (existing && !existing.isDestroyed()) {
      existing.close();
      harvesterWindows.delete(id);
    }
    return { success: true };
  });

  ipcMain.handle('harvester:status', async (_, id: string) => {
    const existing = harvesterWindows.get(id);
    return { isOpen: !!existing && !existing.isDestroyed() };
  });
}

// Electron App Lifecycle
app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
