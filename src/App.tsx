import React, { useState, useEffect } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { TwoFactorDrawer } from './components/TwoFactorDrawer';
import { TasksPage } from './pages/TasksPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { ProxiesPage } from './pages/ProxiesPage';
import { AccountsPage } from './pages/AccountsPage';
import { FreebiesPage } from './pages/FreebiesPage';
import { MarketAnalyticsPage } from './pages/MarketAnalyticsPage';
import { CaptchasPage } from './pages/CaptchasPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { firestoreService } from './firebase/firestore-service';
import {
  TaskItem,
  TaskGroup,
  BillingProfile,
  ProxyPool,
  RetailAccount,
  AppSettings,
  ThemeId,
  TwoFactorRequest,
  SystemStats,
  Retailer,
} from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('tasks');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [profiles, setProfiles] = useState<BillingProfile[]>([]);
  const [proxyPools, setProxyPools] = useState<ProxyPool[]>([]);
  const [accounts, setAccounts] = useState<RetailAccount[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    discordWebhookUrl: '',
    discordNotifyOnSuccess: true,
    discordNotifyOnDecline: false,
    playSoundOnSuccess: true,
    encryptionPassphrase: '',
    solverKeys: {},
    defaultMonitorDelay: 3500,
    defaultRetryDelay: 2000,
    autoSolvePX: true,
    shapeHarvestInterval: 180,
  });

  const [pending2FARequests, setPending2FARequests] = useState<TwoFactorRequest[]>([]);
  const [is2FADrawerOpen, setIs2FADrawerOpen] = useState(false);
  const [imapStatus, setImapStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  const [currentTheme, setCurrentTheme] = useState<ThemeId>('oled');

  // Load initial data
  useEffect(() => {
    const loadState = async () => {
      const [g, t, p, px, a, s] = await Promise.all([
        firestoreService.getTaskGroups(),
        firestoreService.getTasks(),
        firestoreService.getProfiles(),
        firestoreService.getProxyPools(),
        firestoreService.getAccounts(),
        firestoreService.getSettings(),
      ]);

      // Filter out any previous dummy demo data so tables start completely clean
      const cleanProfiles = p.filter((item) => item.id !== 'prof_default');
      const cleanProxies = px.filter((item) => item.id !== 'pool_monitor_isp');

      // Sync cleaned state back to local storage
      if (cleanProfiles.length !== p.length) {
        localStorage.setItem('blank_bot_profiles', JSON.stringify(cleanProfiles));
      }
      if (cleanProxies.length !== px.length) {
        localStorage.setItem('blank_bot_proxy_pools', JSON.stringify(cleanProxies));
      }

      setTaskGroups(g);
      setProxyPools(cleanProxies);
      setProfiles(cleanProfiles);
      setTasks(t);
      setAccounts(a);
      setSettings(s);

      const savedTheme = (localStorage.getItem('blank_theme') as ThemeId) || s.theme || 'oled';
      setCurrentTheme(savedTheme);
      document.documentElement.className = `theme-${savedTheme} dark`;
    };

    loadState();
  }, []);

  // Auto-redirect away from freebies if disabled in settings
  useEffect(() => {
    if (settings.enableFreebiesSniper === false && currentPage === 'freebies') {
      setCurrentPage('tasks');
    }
  }, [settings.enableFreebiesSniper, currentPage]);

  // Listen for real-time task updates and 2FA requests via Electron IPC
  useEffect(() => {
    if (window.blankBotAPI) {
      const unsubTask = window.blankBotAPI.onTaskUpdate((data) => {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === data.taskId) {
              const updatedLogs = data.log ? [...t.logs, data.log] : t.logs;
              return {
                ...t,
                status: data.status,
                statusMessage: data.message,
                checkoutLatency: data.latency ?? t.checkoutLatency,
                orderId: data.orderId ?? t.orderId,
                logs: updatedLogs,
                updatedAt: Date.now(),
              };
            }
            return t;
          })
        );
      });

      const unsub2FA = window.blankBotAPI.on2FARequest((req) => {
        setPending2FARequests((prev) => [...prev, req]);
        setIs2FADrawerOpen(true);
      });

      window.blankBotAPI.getIMAPStatus().then(setImapStatus);

      return () => {
        unsubTask();
        unsub2FA();
      };
    }
  }, []);

  // Handlers for Tasks
  const handleSaveTask = async (taskData: Partial<TaskItem>) => {
    const isNew = !taskData.id;
    const task: TaskItem = {
      id: taskData.id || `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      groupId: taskData.groupId || taskGroups[0]?.id || 'default',
      retailer: taskData.retailer || 'bestbuy',
      input: taskData.input || '',
      monitorDelay: taskData.monitorDelay || 3500,
      retryDelay: taskData.retryDelay || 2000,
      profileId: taskData.profileId || profiles[0]?.id || '',
      proxyPoolId: taskData.proxyPoolId || '',
      accountId: taskData.accountId,
      status: 'IDLE',
      statusMessage: 'Ready',
      flags: taskData.flags || { skipMonitor: false, loopCheckout: false, autoStartOnRestart: false },
      scheduledStartEpoch: taskData.scheduledStartEpoch,
      scheduledStopEpoch: taskData.scheduledStopEpoch,
      logs: [],
      createdAt: isNew ? Date.now() : (taskData.createdAt || Date.now()),
      updatedAt: Date.now(),
    };

    await firestoreService.saveTask(task);
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = task;
        return next;
      }
      return [...prev, task];
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.blankBotAPI) await window.blankBotAPI.stopTask(taskId);
    await firestoreService.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleStartTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const profile = profiles.find((p) => p.id === task.profileId) || profiles[0];
    const pool = proxyPools.find((p) => p.id === task.proxyPoolId);
    const account = accounts.find((a) => a.id === task.accountId);

    if (window.blankBotAPI) {
      window.blankBotAPI.startTask(task, profile, pool, account);
    } else {
      // Browser fallback simulation
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: 'MONITORING', statusMessage: 'Monitoring stock (browser mode)' }
            : t
        )
      );
    }
  };

  const handleStopTask = (taskId: string) => {
    if (window.blankBotAPI) {
      window.blankBotAPI.stopTask(taskId);
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: 'STOPPED', statusMessage: 'Task stopped' } : t
        )
      );
    }
  };

  const handleMassStart = (taskIds: string[]) => {
    for (const id of taskIds) {
      handleStartTask(id);
    }
  };

  const handleMassStop = (taskIds: string[]) => {
    if (window.blankBotAPI) {
      window.blankBotAPI.massStopTasks(taskIds);
    }
    for (const id of taskIds) {
      handleStopTask(id);
    }
  };

  // Groups
  const handleCreateGroup = async (name: string, retailer: Retailer) => {
    const group: TaskGroup = {
      id: `grp_${Date.now()}`,
      name,
      retailer,
      createdAt: Date.now(),
    };
    await firestoreService.saveTaskGroup(group);
    setTaskGroups((prev) => [...prev, group]);
  };

  const handleDeleteGroup = async (groupId: string) => {
    await firestoreService.deleteTaskGroup(groupId);
    setTaskGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  // Profiles
  const handleSaveProfile = async (profile: BillingProfile) => {
    await firestoreService.saveProfile(profile);
    setProfiles((prev) => {
      const idx = prev.findIndex((p) => p.id === profile.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = profile;
        return next;
      }
      return [...prev, profile];
    });
  };

  const handleDeleteProfile = async (profileId: string) => {
    await firestoreService.deleteProfile(profileId);
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
  };

  // Proxies
  const handleSavePool = async (pool: ProxyPool) => {
    await firestoreService.saveProxyPool(pool);
    setProxyPools((prev) => {
      const idx = prev.findIndex((p) => p.id === pool.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = pool;
        return next;
      }
      return [...prev, pool];
    });
  };

  const handleDeletePool = async (poolId: string) => {
    await firestoreService.deleteProxyPool(poolId);
    setProxyPools((prev) => prev.filter((p) => p.id !== poolId));
  };

  // Accounts
  const handleSaveAccount = async (account: RetailAccount) => {
    await firestoreService.saveAccount(account);
    setAccounts((prev) => [...prev, account]);
  };

  const handleDeleteAccount = async (accountId: string) => {
    await firestoreService.deleteAccount(accountId);
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
  };

  // Settings & Backups
  const handleSaveSettings = async (newSettings: AppSettings) => {
    await firestoreService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleThemeChange = async (theme: ThemeId) => {
    setCurrentTheme(theme);
    document.documentElement.className = `theme-${theme} dark`;
    localStorage.setItem('blank_theme', theme);
    const updated = { ...settings, theme };
    setSettings(updated);
    await firestoreService.saveSettings(updated);
  };

  const handleCreateQuickTask = async (item: { asin: string; title: string; price: number }) => {
    let amazonGroup = taskGroups.find((g) => g.retailer === 'amazon');
    if (!amazonGroup) {
      const newGroup: TaskGroup = {
        id: `grp_${Date.now()}`,
        name: 'Amazon Freebies & Deals',
        retailer: 'amazon',
        createdAt: Date.now(),
      };
      await firestoreService.saveTaskGroup(newGroup);
      setTaskGroups((prev) => [...prev, newGroup]);
      amazonGroup = newGroup;
    }

    const newTask: TaskItem = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      groupId: amazonGroup.id,
      retailer: 'amazon',
      input: item.asin,
      profileId: profiles[0]?.id || '',
      proxyPoolId: proxyPools[0]?.id || '',
      monitorDelay: settings.defaultMonitorDelay || 3500,
      retryDelay: settings.defaultRetryDelay || 2000,
      status: 'IDLE',
      statusMessage: 'Ready (Quick Task)',
      flags: {
        skipMonitor: true,
        loopCheckout: false,
        autoStartOnRestart: false,
      },
      logs: [
        {
          timestamp: Date.now(),
          level: 'info',
          message: `Quick Task provisioned for ASIN ${item.asin} ($${item.price.toFixed(2)})`,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await handleSaveTask(newTask);
    await handleStartTask(newTask.id);
  };

  const handleCreateMarketTask = async (item: {
    retailer: Retailer;
    identifier: string;
    name: string;
    msrp?: number;
    marketPrice?: number;
  }) => {
    let targetGroup = taskGroups.find((g) => g.retailer === item.retailer);
    if (!targetGroup) {
      const retailerNames: Record<Retailer, string> = {
        target: 'Target Operations',
        bestbuy: 'Best Buy Hub',
        walmart: 'Walmart Supercenter',
        amazon: 'Amazon Direct',
        apple: 'Apple Store',
      };
      const newGroup: TaskGroup = {
        id: `grp_${Date.now()}`,
        name: retailerNames[item.retailer] || `${item.retailer.toUpperCase()} Targets`,
        retailer: item.retailer,
        createdAt: Date.now(),
      };
      await firestoreService.saveTaskGroup(newGroup);
      setTaskGroups((prev) => [...prev, newGroup]);
      targetGroup = newGroup;
    }

    const profitSpread = item.marketPrice && item.msrp ? item.marketPrice - item.msrp : 0;
    const newTask: TaskItem = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      groupId: targetGroup.id,
      retailer: item.retailer,
      input: item.identifier,
      profileId: profiles[0]?.id || '',
      proxyPoolId: proxyPools[0]?.id || '',
      monitorDelay: settings.defaultMonitorDelay || 3500,
      retryDelay: settings.defaultRetryDelay || 2000,
      status: 'IDLE',
      statusMessage: `Ready (${item.name})`,
      flags: {
        skipMonitor: false,
        loopCheckout: false,
        autoStartOnRestart: false,
      },
      logs: [
        {
          timestamp: Date.now(),
          level: 'info',
          message: `Market Intelligence task provisioned for ${item.name} (${item.identifier})${
            profitSpread > 0 ? ` - Est. Spread: +$${profitSpread.toFixed(2)}` : ''
          }`,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await handleSaveTask(newTask);
    setCurrentPage('tasks');
  };

  const handleExportBackup = async () => {
    const backup = {
      taskGroups,
      tasks,
      profiles,
      proxyPools,
      accounts,
      settings,
      exportedAt: Date.now(),
    };
    const json = JSON.stringify(backup, null, 2);
    if (window.blankBotAPI) {
      await window.blankBotAPI.exportBackup(json);
    } else {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blank-bot-backup-${Date.now()}.json`;
      a.click();
    }
  };

  const handleImportBackup = async () => {
    if (window.blankBotAPI) {
      const res = await window.blankBotAPI.importBackup();
      if (res.success && res.data) {
        try {
          const parsed = JSON.parse(res.data);
          if (parsed.tasks) setTasks(parsed.tasks);
          if (parsed.profiles) setProfiles(parsed.profiles);
          if (parsed.proxyPools) setProxyPools(parsed.proxyPools);
          if (parsed.taskGroups) setTaskGroups(parsed.taskGroups);
          alert('Backup restored successfully!');
        } catch {
          alert('Invalid backup file format');
        }
      }
    }
  };

  // 2FA Submit Code
  const handleSubmit2FACode = async (requestId: string, code: string): Promise<boolean> => {
    if (window.blankBotAPI) {
      const ok = await window.blankBotAPI.submit2FACode(requestId, code);
      if (ok) {
        setPending2FARequests((prev) => prev.filter((r) => r.id !== requestId));
      }
      return ok;
    }
    setPending2FARequests((prev) => prev.filter((r) => r.id !== requestId));
    return true;
  };

  const activeTasks = tasks.filter(
    (t) =>
      t.status === 'MONITORING' ||
      t.status === 'QUEUE' ||
      t.status === 'CARTING' ||
      t.status === 'WAITING_2FA' ||
      t.status === 'CHECKING_OUT'
  ).length;

  const totalProxies = proxyPools.reduce((acc, p) => acc + p.proxies.length, 0);

  const systemStats: SystemStats = {
    activeTasks,
    totalTasks: tasks.length,
    successCount: tasks.filter((t) => t.status === 'SUCCESS').length,
    failedCount: tasks.filter((t) => t.status === 'FAILED').length,
    imapStatus,
    activeProxies: totalProxies,
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-950 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        activeTasksCount={activeTasks}
        enableFreebiesSniper={settings.enableFreebiesSniper ?? true}
        enableMarketAnalytics={settings.enableMarketAnalytics ?? true}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={currentPage}
          stats={systemStats}
          onMassStart={() => handleMassStart(tasks.map((t) => t.id))}
          onMassStop={() => handleMassStop(tasks.map((t) => t.id))}
          onToggle2FADrawer={() => setIs2FADrawerOpen(true)}
          pending2FACount={pending2FARequests.length}
        />

        <main className="flex-1 flex overflow-hidden">
          {currentPage === 'tasks' && (
            <TasksPage
              tasks={tasks}
              taskGroups={taskGroups}
              profiles={profiles}
              proxyPools={proxyPools}
              accounts={accounts}
              onSaveTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              onStartTask={handleStartTask}
              onStopTask={handleStopTask}
              onMassStart={handleMassStart}
              onMassStop={handleMassStop}
              onCreateGroup={handleCreateGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          )}

          {currentPage === 'profiles' && (
            <ProfilesPage
              profiles={profiles}
              onSaveProfile={handleSaveProfile}
              onDeleteProfile={handleDeleteProfile}
            />
          )}

          {currentPage === 'proxies' && (
            <ProxiesPage
              proxyPools={proxyPools}
              onSavePool={handleSavePool}
              onDeletePool={handleDeletePool}
            />
          )}

          {currentPage === 'accounts' && (
            <AccountsPage
              accounts={accounts}
              onSaveAccount={handleSaveAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          )}

          {currentPage === 'freebies' && (
            <FreebiesPage
              profiles={profiles}
              proxyPools={proxyPools}
              onCreateQuickTask={handleCreateQuickTask}
            />
          )}

          {currentPage === 'analytics' && (
            <MarketAnalyticsPage onCreateTaskWithItem={handleCreateMarketTask} />
          )}

          {currentPage === 'captchas' && (
            <CaptchasPage
              solverKeys={settings.solverKeys || {}}
              onSaveKeys={async (keys) => {
                await handleSaveSettings({ ...settings, solverKeys: keys });
              }}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onThemeChange={handleThemeChange}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
            />
          )}

          {currentPage === 'auth' && <AuthPage />}
        </main>
      </div>

      {/* Manual 2FA Challenge Drawer */}
      <TwoFactorDrawer
        isOpen={is2FADrawerOpen}
        onClose={() => setIs2FADrawerOpen(false)}
        pendingRequests={pending2FARequests}
        onSubmitCode={handleSubmit2FACode}
      />
    </div>
  );
};
