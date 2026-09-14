import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './config';
import {
  TaskGroup,
  TaskItem,
  BillingProfile,
  ProxyPool,
  RetailAccount,
  AppSettings,
} from '../types';

export class FirestoreSyncService {
  private getUserId(): string | null {
    return auth?.currentUser?.uid || null;
  }

  // --- LOCAL FALLBACK STORAGE HELPERS ---
  private getLocal<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(`blank_bot_${key}`);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setLocal<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`blank_bot_${key}`, JSON.stringify(data));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  }

  // --- TASK GROUPS ---
  public async saveTaskGroup(group: TaskGroup): Promise<void> {
    const groups = this.getLocal<TaskGroup[]>('task_groups', []);
    const idx = groups.findIndex((g) => g.id === group.id);
    if (idx >= 0) groups[idx] = group;
    else groups.push(group);
    this.setLocal('task_groups', groups);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      const ref = doc(db, 'taskGroups', group.id);
      await setDoc(ref, { ...group, userId: uid });
    }
  }

  public async getTaskGroups(): Promise<TaskGroup[]> {
    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      try {
        const q = query(collection(db, 'taskGroups'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        const cloudGroups: TaskGroup[] = [];
        snapshot.forEach((d) => cloudGroups.push(d.data() as TaskGroup));
        if (cloudGroups.length > 0) {
          this.setLocal('task_groups', cloudGroups);
          return cloudGroups;
        }
      } catch (err) {
        console.warn('Cloud task groups fetch failed, using local storage:', err);
      }
    }
    return this.getLocal<TaskGroup[]>('task_groups', []);
  }

  public async deleteTaskGroup(groupId: string): Promise<void> {
    const groups = this.getLocal<TaskGroup[]>('task_groups', []).filter((g) => g.id !== groupId);
    this.setLocal('task_groups', groups);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      await deleteDoc(doc(db, 'taskGroups', groupId));
    }
  }

  // --- TASKS ---
  public async saveTask(task: TaskItem): Promise<void> {
    const tasks = this.getLocal<TaskItem[]>('tasks', []);
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) tasks[idx] = task;
    else tasks.push(task);
    this.setLocal('tasks', tasks);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      const ref = doc(db, 'tasks', task.id);
      await setDoc(ref, { ...task, userId: uid });
    }
  }

  public async getTasks(): Promise<TaskItem[]> {
    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      try {
        const q = query(collection(db, 'tasks'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        const cloudTasks: TaskItem[] = [];
        snapshot.forEach((d) => cloudTasks.push(d.data() as TaskItem));
        if (cloudTasks.length > 0) {
          this.setLocal('tasks', cloudTasks);
          return cloudTasks;
        }
      } catch (err) {
        console.warn('Cloud tasks fetch failed, using local storage:', err);
      }
    }
    return this.getLocal<TaskItem[]>('tasks', []);
  }

  public async deleteTask(taskId: string): Promise<void> {
    const tasks = this.getLocal<TaskItem[]>('tasks', []).filter((t) => t.id !== taskId);
    this.setLocal('tasks', tasks);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      await deleteDoc(doc(db, 'tasks', taskId));
    }
  }

  // --- PROFILES (CLIENT-SIDE ENCRYPTED) ---
  public async saveProfile(profile: BillingProfile): Promise<void> {
    const profiles = this.getLocal<BillingProfile[]>('profiles', []);
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) profiles[idx] = profile;
    else profiles.push(profile);
    this.setLocal('profiles', profiles);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      const ref = doc(db, 'profiles', profile.id);
      // Stored with client-encrypted PAN & CVV
      await setDoc(ref, { ...profile, userId: uid });
    }
  }

  public async getProfiles(): Promise<BillingProfile[]> {
    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      try {
        const q = query(collection(db, 'profiles'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        const cloudProfiles: BillingProfile[] = [];
        snapshot.forEach((d) => cloudProfiles.push(d.data() as BillingProfile));
        if (cloudProfiles.length > 0) {
          this.setLocal('profiles', cloudProfiles);
          return cloudProfiles;
        }
      } catch (err) {
        console.warn('Cloud profiles fetch error, using local fallback:', err);
      }
    }
    return this.getLocal<BillingProfile[]>('profiles', []);
  }

  public async deleteProfile(profileId: string): Promise<void> {
    const profiles = this.getLocal<BillingProfile[]>('profiles', []).filter((p) => p.id !== profileId);
    this.setLocal('profiles', profiles);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      await deleteDoc(doc(db, 'profiles', profileId));
    }
  }

  // --- PROXY POOLS ---
  public async saveProxyPool(pool: ProxyPool): Promise<void> {
    const pools = this.getLocal<ProxyPool[]>('proxy_pools', []);
    const idx = pools.findIndex((p) => p.id === pool.id);
    if (idx >= 0) pools[idx] = pool;
    else pools.push(pool);
    this.setLocal('proxy_pools', pools);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      const ref = doc(db, 'proxyPools', pool.id);
      await setDoc(ref, { ...pool, userId: uid });
    }
  }

  public async getProxyPools(): Promise<ProxyPool[]> {
    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      try {
        const q = query(collection(db, 'proxyPools'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        const cloudPools: ProxyPool[] = [];
        snapshot.forEach((d) => cloudPools.push(d.data() as ProxyPool));
        if (cloudPools.length > 0) {
          this.setLocal('proxy_pools', cloudPools);
          return cloudPools;
        }
      } catch (err) {
        console.warn('Cloud proxy pools fetch error:', err);
      }
    }
    return this.getLocal<ProxyPool[]>('proxy_pools', []);
  }

  public async deleteProxyPool(poolId: string): Promise<void> {
    const pools = this.getLocal<ProxyPool[]>('proxy_pools', []).filter((p) => p.id !== poolId);
    this.setLocal('proxy_pools', pools);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      await deleteDoc(doc(db, 'proxyPools', poolId));
    }
  }

  // --- RETAIL ACCOUNTS ---
  public async saveAccount(account: RetailAccount): Promise<void> {
    const accounts = this.getLocal<RetailAccount[]>('accounts', []);
    const idx = accounts.findIndex((a) => a.id === account.id);
    if (idx >= 0) accounts[idx] = account;
    else accounts.push(account);
    this.setLocal('accounts', accounts);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      const ref = doc(db, 'accounts', account.id);
      await setDoc(ref, { ...account, userId: uid });
    }
  }

  public async getAccounts(): Promise<RetailAccount[]> {
    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      try {
        const q = query(collection(db, 'accounts'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        const cloudAccounts: RetailAccount[] = [];
        snapshot.forEach((d) => cloudAccounts.push(d.data() as RetailAccount));
        if (cloudAccounts.length > 0) {
          this.setLocal('accounts', cloudAccounts);
          return cloudAccounts;
        }
      } catch (err) {
        console.warn('Cloud accounts fetch error:', err);
      }
    }
    return this.getLocal<RetailAccount[]>('accounts', []);
  }

  public async deleteAccount(accountId: string): Promise<void> {
    const accounts = this.getLocal<RetailAccount[]>('accounts', []).filter((a) => a.id !== accountId);
    this.setLocal('accounts', accounts);

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      await deleteDoc(doc(db, 'accounts', accountId));
    }
  }

  // --- SETTINGS ---
  public async saveSettings(settings: AppSettings): Promise<void> {
    this.setLocal('settings', settings);
    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      const ref = doc(db, 'settings', uid);
      await setDoc(ref, settings);
    }
  }

  public async getSettings(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
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
    };

    const uid = this.getUserId();
    if (isFirebaseConfigured && db && uid) {
      try {
        const q = query(collection(db, 'settings'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return snapshot.docs[0].data() as AppSettings;
        }
      } catch (err) {
        console.warn('Settings cloud fetch error:', err);
      }
    }
    return this.getLocal<AppSettings>('settings', defaultSettings);
  }
}

export const firestoreService = new FirestoreSyncService();
