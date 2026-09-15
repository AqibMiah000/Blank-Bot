import EventEmitter from 'events';
import dns from 'dns';
import http from 'http';
import https from 'https';

export interface NetworkConnectivityStatus {
  isOnline: boolean;
  latencyMs: number | null;
  lastChecked: number;
  error?: string | null;
}

export class NetworkSentinel extends EventEmitter {
  private isOnline: boolean = true;
  private latencyMs: number | null = null;
  private lastChecked: number = 0;
  private monitorTimer: NodeJS.Timeout | null = null;
  private isChecking: boolean = false;

  constructor() {
    super();
  }

  public getStatus(): NetworkConnectivityStatus {
    return {
      isOnline: this.isOnline,
      latencyMs: this.latencyMs,
      lastChecked: this.lastChecked,
    };
  }

  /**
   * Actively queries DNS and fallback HTTP endpoints to verify true WAN internet access
   */
  public async checkConnectivity(): Promise<NetworkConnectivityStatus> {
    const startTime = Date.now();

    // 1. First probe: High-speed DNS resolution to Cloudflare & Google
    const dnsSuccess = await this.probeDns(['cloudflare.com', 'google.com', 'one.one.one.one']);
    if (dnsSuccess) {
      const latency = Math.max(1, Date.now() - startTime);
      this.updateState(true, latency);
      return this.getStatus();
    }

    // 2. Second probe: HTTP/HTTPS 204 connectivity test (in case DNS is poisoned or captive portal)
    const httpSuccess = await this.probeHttp();
    if (httpSuccess) {
      const latency = Math.max(1, Date.now() - startTime);
      this.updateState(true, latency);
      return this.getStatus();
    }

    // If both failed, host has no internet connection
    this.updateState(false, null, 'No internet connection detected');
    return {
      isOnline: false,
      latencyMs: null,
      lastChecked: Date.now(),
      error: 'No internet connection detected',
    };
  }

  private async probeDns(hosts: string[]): Promise<boolean> {
    for (const host of hosts) {
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('DNS Timeout')), 2500);
          dns.lookup(host, (err) => {
            clearTimeout(timeout);
            if (err) reject(err);
            else resolve();
          });
        });
        return true;
      } catch {
        // Try next host
      }
    }
    return false;
  }

  private async probeHttp(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const req = http.get('http://connectivitycheck.gstatic.com/generate_204', { timeout: 3000 }, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      req.on('error', () => {
        // Fallback to 1.1.1.1
        const secureReq = https.get('https://1.1.1.1', { timeout: 3000 }, (res) => {
          resolve(!!res.statusCode);
        });
        secureReq.on('error', () => resolve(false));
      });
    });
  }

  private updateState(isOnline: boolean, latencyMs: number | null, error?: string): void {
    const changed = this.isOnline !== isOnline;
    this.isOnline = isOnline;
    this.latencyMs = latencyMs;
    this.lastChecked = Date.now();

    this.emit('status', {
      isOnline,
      latencyMs,
      lastChecked: this.lastChecked,
      error: error || null,
    });

    if (changed) {
      this.emit('connection_change', {
        isOnline,
        latencyMs,
        lastChecked: this.lastChecked,
      });
    }
  }

  /**
   * Starts background network heartbeat monitoring (default every 5s)
   */
  public startMonitoring(intervalMs: number = 5000): void {
    if (this.monitorTimer) clearInterval(this.monitorTimer);

    // Initial check
    this.checkConnectivity().catch(() => {});

    this.monitorTimer = setInterval(async () => {
      if (this.isChecking) return;
      this.isChecking = true;
      try {
        await this.checkConnectivity();
      } finally {
        this.isChecking = false;
      }
    }, intervalMs);
  }

  public stopMonitoring(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
  }
}

export const networkSentinel = new NetworkSentinel();
