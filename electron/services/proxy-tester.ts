import { gotScraping } from 'got-scraping';
import { ProxyItem, ProxyProtocol } from '../../src/types';

export const RETAIL_PING_TARGETS: Record<string, string> = {
  bestbuy: 'https://www.bestbuy.com',
  walmart: 'https://www.walmart.com',
  target: 'https://www.target.com',
  amazon: 'https://www.amazon.com',
  apple: 'https://www.apple.com',
  google: 'https://www.google.com/generate_204',
};

/**
 * Parses raw proxy strings in formats:
 * - host:port
 * - host:port:user:pass
 * - user:pass@host:port
 * - protocol://host:port...
 */
export function parseProxyString(raw: string, defaultProtocol: ProxyProtocol = 'http'): ProxyItem {
  const clean = raw.trim();
  let protocol: ProxyProtocol = defaultProtocol;
  let remaining = clean;

  if (remaining.startsWith('http://')) {
    protocol = 'http';
    remaining = remaining.substring(7);
  } else if (remaining.startsWith('https://')) {
    protocol = 'https';
    remaining = remaining.substring(8);
  } else if (remaining.startsWith('socks5://')) {
    protocol = 'socks5';
    remaining = remaining.substring(9);
  }

  let host = '';
  let port = 80;
  let username: string | undefined;
  let password: string | undefined;

  if (remaining.includes('@')) {
    // user:pass@host:port
    const [authPart, hostPart] = remaining.split('@');
    const authParts = authPart.split(':');
    username = authParts[0];
    password = authParts.slice(1).join(':');

    const [h, p] = hostPart.split(':');
    host = h;
    port = parseInt(p, 10) || 80;
  } else {
    // host:port or host:port:user:pass
    const parts = remaining.split(':');
    if (parts.length === 2) {
      host = parts[0];
      port = parseInt(parts[1], 10) || 80;
    } else if (parts.length >= 4) {
      host = parts[0];
      port = parseInt(parts[1], 10) || 80;
      username = parts[2];
      password = parts.slice(3).join(':');
    } else {
      host = remaining;
      port = 80;
    }
  }

  const id = `proxy_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return {
    id,
    raw: clean,
    host,
    port,
    username,
    password,
    protocol,
    status: 'untested',
  };
}

/**
 * Formats a ProxyItem into an executable proxy URL for gotScraping
 */
export function formatProxyUrl(proxy: ProxyItem): string {
  const scheme = proxy.protocol || 'http';
  if (proxy.username && proxy.password) {
    return `${scheme}://${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@${proxy.host}:${proxy.port}`;
  }
  return `${scheme}://${proxy.host}:${proxy.port}`;
}

/**
 * Pings a single proxy against a target retail endpoint and computes latency in milliseconds
 */
export async function pingProxy(
  proxy: ProxyItem,
  targetUrl: string = RETAIL_PING_TARGETS.google,
  timeoutMs: number = 7000
): Promise<{ latencyMs: number; status: 'active' | 'dead' }> {
  const proxyUrl = formatProxyUrl(proxy);
  const startTime = Date.now();

  try {
    const response = await gotScraping(targetUrl, {
      proxyUrl,
      timeout: { request: timeoutMs },
      retry: { limit: 0 },
      throwHttpErrors: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const latencyMs = Date.now() - startTime;
    const isSuccess = response.statusCode >= 200 && response.statusCode < 400;

    return {
      latencyMs,
      status: isSuccess ? 'active' : 'dead',
    };
  } catch (err) {
    return {
      latencyMs: 9999,
      status: 'dead',
    };
  }
}

/**
 * Concurrently benchmark an entire pool of proxies with bounded worker concurrency
 */
export async function benchmarkProxyPool(
  proxies: ProxyItem[],
  targetUrl: string = RETAIL_PING_TARGETS.bestbuy,
  concurrency: number = 10
): Promise<ProxyItem[]> {
  const results: ProxyItem[] = [...proxies];
  const queue = [...results];
  const workers: Promise<void>[] = [];

  for (let i = 0; i < concurrency; i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (!item) break;
          const pingResult = await pingProxy(item, targetUrl);
          item.latencyMs = pingResult.latencyMs;
          item.status = pingResult.status;
        }
      })()
    );
  }

  await Promise.all(workers);
  return results;
}
