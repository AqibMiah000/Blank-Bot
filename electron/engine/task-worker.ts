import EventEmitter from 'events';
import {
  TaskItem,
  BillingProfile,
  ProxyPool,
  ProxyItem,
  RetailAccount,
  TaskStatus,
  TaskLogEntry,
} from '../../src/types';
import { RetailTLSClient } from '../network/tls-client';
import { formatProxyUrl } from '../services/proxy-tester';

export abstract class BaseTaskWorker extends EventEmitter {
  public task: TaskItem;
  public profile: BillingProfile;
  public proxyPool?: ProxyPool;
  public account?: RetailAccount;

  protected isStopped: boolean = false;
  protected client: RetailTLSClient;
  protected activeProxy?: ProxyItem;

  constructor(
    task: TaskItem,
    profile: BillingProfile,
    proxyPool?: ProxyPool,
    account?: RetailAccount
  ) {
    super();
    this.task = task;
    this.profile = profile;
    this.proxyPool = proxyPool;
    this.account = account;

    // Pick initial proxy from pool
    this.activeProxy = this.selectProxy();
    this.client = new RetailTLSClient({
      proxyUrl: this.activeProxy ? formatProxyUrl(this.activeProxy) : undefined,
    });
  }

  public stop(): void {
    this.isStopped = true;
    this.updateStatus('STOPPED', 'Task stopped by user');
  }

  public abstract run(): Promise<void>;

  protected updateStatus(
    status: TaskStatus,
    message: string,
    extra?: { latency?: number; orderId?: string; level?: 'info' | 'warn' | 'error' | 'success' }
  ): void {
    const logEntry: TaskLogEntry = {
      timestamp: Date.now(),
      level: extra?.level || (status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'error' : 'info'),
      message: `[${status}] ${message}`,
    };

    this.task.status = status;
    this.task.statusMessage = message;
    if (extra?.latency !== undefined) {
      this.task.checkoutLatency = extra.latency;
    }
    if (extra?.orderId) {
      this.task.orderId = extra.orderId;
    }
    this.task.logs.push(logEntry);

    this.emit('update', {
      taskId: this.task.id,
      status,
      message,
      latency: extra?.latency,
      orderId: extra?.orderId,
      log: logEntry,
    });
  }

  protected log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
    const logEntry: TaskLogEntry = {
      timestamp: Date.now(),
      level,
      message,
    };
    this.task.logs.push(logEntry);
    this.emit('update', {
      taskId: this.task.id,
      status: this.task.status,
      message: this.task.statusMessage,
      log: logEntry,
    });
  }

  protected rotateProxy(): void {
    this.activeProxy = this.selectProxy();
    const proxyUrl = this.activeProxy ? formatProxyUrl(this.activeProxy) : undefined;
    this.client = new RetailTLSClient({ proxyUrl });
    this.log(`Rotated proxy to: ${this.activeProxy?.host || 'Local/Direct'}`);
  }

  protected selectProxy(): ProxyItem | undefined {
    if (!this.proxyPool || !this.proxyPool.proxies.length) {
      return undefined;
    }
    const proxies = this.proxyPool.proxies;
    // Prefer active proxies, random load balancing
    const active = proxies.filter((p) => p.status !== 'dead');
    const poolToPick = active.length > 0 ? active : proxies;
    return poolToPick[Math.floor(Math.random() * poolToPick.length)];
  }

  protected async sleep(ms: number): Promise<void> {
    if (this.isStopped) return;
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      const checkInterval = setInterval(() => {
        if (this.isStopped) {
          clearTimeout(timer);
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
}
