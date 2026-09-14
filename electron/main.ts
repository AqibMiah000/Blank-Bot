import electron from 'electron';
const { app, BrowserWindow, ipcMain, Menu, shell, session } = electron;
import path from 'path';
import { fileURLToPath } from 'url';
import { encryptData, decryptData } from './crypto/cipher';
import { taskEngine } from './engine/task-engine';
import { imapWorker } from './services/imap-worker';
import { pingProxy, benchmarkProxyPool } from './services/proxy-tester';
import { antiBotEngine } from './services/antibot';
import { sendDiscordCheckoutWebhook } from './services/discord';
import { audioService } from './services/audio';
import { exportBackupToFile, importBackupFromFile } from './services/storage';
import { freebiesSniper, fetchLiveAmazonDeals } from './modules/amazon';
import { TaskItem, BillingProfile, ProxyPool, RetailAccount, FreebiesConfig, ProxyItem } from '../src/types';

// Remove default File/Edit/View menu bar for clean, minimal UI
Menu.setApplicationMenu(null);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
const harvesterWindows = new Map<string, BrowserWindow>();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 980,
    minHeight: 650,
    title: 'Blank — High-Frequency Retail Automation',
    icon: path.join(__dirname, '../build/icon.png'),
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

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      // Fallback to static if Vite server not yet ready
      mainWindow?.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
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
        backgroundColor: '#0a0a0c',
        autoHideMenuBar: true,
        webPreferences: {
          session: sess,
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
        },
      });

      harvesterWin.setMenuBarVisibility(false);
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
