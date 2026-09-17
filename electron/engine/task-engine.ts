import EventEmitter from 'events';
import {
  TaskItem,
  BillingProfile,
  ProxyPool,
  RetailAccount,
  TaskStatus,
  TaskLogEntry,
  TwoFactorRequest,
} from '../../src/types';
import { BaseTaskWorker } from './task-worker';
import { BestBuyWorker } from '../modules/bestbuy';
import { WalmartWorker } from '../modules/walmart';
import { TargetWorker } from '../modules/target';
import { AmazonWorker } from '../modules/amazon';
import { AppleWorker } from '../modules/apple';
import { GameStopWorker } from '../modules/gamestop';
import { sendDiscordCheckoutWebhook } from '../services/discord';
import { audioService } from '../services/audio';
import { networkSentinel } from '../services/network-sentinel';

export interface TaskEngineEvents {
  task_update: (data: {
    taskId: string;
    status: TaskStatus;
    message: string;
    latency?: number;
    orderId?: string;
    log?: TaskLogEntry;
  }) => void;
  '2fa_required': (req: TwoFactorRequest) => void;
}

export class TaskEngine extends EventEmitter {
  private activeWorkers: Map<string, BaseTaskWorker> = new Map();
  private scheduledTimers: Map<string, { start?: NodeJS.Timeout; stop?: NodeJS.Timeout }> = new Map();
  private webhookUrl?: string;

  constructor() {
    super();
  }

  public setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }

  /**
   * Spawns and launches a task worker
   */
  public startTask(
    task: TaskItem,
    profile: BillingProfile,
    proxyPool?: ProxyPool,
    account?: RetailAccount
  ): boolean {
    if (this.activeWorkers.has(task.id)) {
      this.stopTask(task.id);
    }

    const netStatus = networkSentinel.getStatus();
    if (!netStatus.isOnline) {
      this.emit('task_update', {
        taskId: task.id,
        status: 'FAILED',
        message: 'Network Error: No internet connection. Check Wi-Fi/Ethernet.',
        log: {
          timestamp: Date.now(),
          level: 'error',
          message: '[FAILED] Cannot start task: Host system is offline.',
        },
      });
      return false;
    }

    // Check epoch schedule if specified
    if (task.scheduledStartEpoch && task.scheduledStartEpoch > Date.now()) {
      const delay = task.scheduledStartEpoch - Date.now();
      const timer = setTimeout(() => {
        task.scheduledStartEpoch = undefined;
        this.launchWorker(task, profile, proxyPool, account);
      }, delay);

      const existing = this.scheduledTimers.get(task.id) || {};
      existing.start = timer;
      this.scheduledTimers.set(task.id, existing);

      this.emit('task_update', {
        taskId: task.id,
        status: 'WAITING_FOR_DROP',
        message: `Task scheduled to start at ${new Date(task.scheduledStartEpoch).toLocaleTimeString()}`,
      });
      return true;
    }

    return this.launchWorker(task, profile, proxyPool, account);
  }

  private launchWorker(
    task: TaskItem,
    profile: BillingProfile,
    proxyPool?: ProxyPool,
    account?: RetailAccount
  ): boolean {
    let worker: BaseTaskWorker;

    switch (task.retailer) {
      case 'bestbuy':
        worker = new BestBuyWorker(task, profile, proxyPool, account);
        break;
      case 'walmart':
        worker = new WalmartWorker(task, profile, proxyPool, account);
        break;
      case 'target':
        worker = new TargetWorker(task, profile, proxyPool, account);
        break;
      case 'amazon':
        worker = new AmazonWorker(task, profile, proxyPool, account);
        break;
      case 'apple':
        worker = new AppleWorker(task, profile, proxyPool, account);
        break;
      case 'gamestop':
        worker = new GameStopWorker(task, profile, proxyPool, account);
        break;
      default:
        console.error(`Unsupported retailer: ${task.retailer}`);
        return false;
    }

    // Forward worker updates to engine subscribers
    worker.on('update', (data) => {
      this.emit('task_update', data);

      // If checkout success, fire Discord webhook and audio alert
      if (data.status === 'SUCCESS') {
        audioService.playAlertSound('success');
        if (this.webhookUrl) {
          sendDiscordCheckoutWebhook(this.webhookUrl, {
            title: `Item: ${task.input}`,
            sku: task.input,
            retailer: task.retailer,
            price: 'Retail',
            profileName: profile.profileName,
            maskedCard: profile.payment.maskedPan || '•••• 4242',
            latency: data.latency || 850,
            orderId: data.orderId,
          }).catch(console.error);
        }
      }
    });

    worker.on('2fa_required', (req: TwoFactorRequest) => {
      this.emit('2fa_required', req);
    });

    this.activeWorkers.set(task.id, worker);

    // Schedule stop timer if specified
    if (task.scheduledStopEpoch && task.scheduledStopEpoch > Date.now()) {
      const stopDelay = task.scheduledStopEpoch - Date.now();
      const stopTimer = setTimeout(() => {
        this.stopTask(task.id);
      }, stopDelay);

      const existing = this.scheduledTimers.get(task.id) || {};
      existing.stop = stopTimer;
      this.scheduledTimers.set(task.id, existing);
    }

    // Run asynchronously
    worker.run().finally(() => {
      this.activeWorkers.delete(task.id);
    });

    return true;
  }

  /**
   * Stop an individual task worker
   */
  public stopTask(taskId: string): boolean {
    const timers = this.scheduledTimers.get(taskId);
    if (timers) {
      if (timers.start) clearTimeout(timers.start);
      if (timers.stop) clearTimeout(timers.stop);
      this.scheduledTimers.delete(taskId);
    }

    const worker = this.activeWorkers.get(taskId);
    if (worker) {
      worker.stop();
      this.activeWorkers.delete(taskId);
      return true;
    }

    this.emit('task_update', {
      taskId,
      status: 'STOPPED',
      message: 'Task stopped',
    });
    return false;
  }

  /**
   * Mass start multiple tasks
   */
  public massStart(
    tasks: TaskItem[],
    profiles: Map<string, BillingProfile>,
    proxyPools: Map<string, ProxyPool>,
    accounts: Map<string, RetailAccount>
  ): number {
    let started = 0;
    for (const task of tasks) {
      const profile = profiles.get(task.profileId);
      if (!profile) continue;

      const pool = task.proxyPoolId ? proxyPools.get(task.proxyPoolId) : undefined;
      const account = task.accountId ? accounts.get(task.accountId) : undefined;

      if (this.startTask(task, profile, pool, account)) {
        started++;
      }
    }
    return started;
  }

  /**
   * Mass stop multiple tasks
   */
  public massStop(taskIds: string[]): number {
    let stopped = 0;
    for (const id of taskIds) {
      if (this.stopTask(id)) {
        stopped++;
      }
    }
    return stopped;
  }

  public getActiveCount(): number {
    return this.activeWorkers.size;
  }
}

export const taskEngine = new TaskEngine();
