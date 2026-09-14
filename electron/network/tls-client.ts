import { gotScraping, OptionsInit, Response } from 'got-scraping';
import http from 'http';
import https from 'https';

export interface TLSClientOptions {
  proxyUrl?: string; // http://user:pass@host:port or socks5://...
  userAgent?: string;
  cookies?: Record<string, string>;
  timeoutMs?: number;
}

export interface RequestMetrics {
  durationMs: number;
  statusCode: number;
  contentLength: number;
}

export class RetailTLSClient {
  private proxyUrl?: string;
  private cookieJar: Map<string, string> = new Map();
  private userAgent: string;
  private timeoutMs: number;

  constructor(options: TLSClientOptions = {}) {
    this.proxyUrl = options.proxyUrl;
    this.timeoutMs = options.timeoutMs || 15000;
    this.userAgent =
      options.userAgent ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

    if (options.cookies) {
      for (const [key, val] of Object.entries(options.cookies)) {
        this.cookieJar.set(key, val);
      }
    }
  }

  public setCookie(key: string, value: string): void {
    this.cookieJar.set(key, value);
  }

  public getCookie(key: string): string | undefined {
    return this.cookieJar.get(key);
  }

  public getCookieHeader(): string {
    const pairs: string[] = [];
    for (const [k, v] of this.cookieJar.entries()) {
      pairs.push(`${k}=${v}`);
    }
    return pairs.join('; ');
  }

  private parseCookiesFromHeaders(headers: http.IncomingHttpHeaders): void {
    const setCookie = headers['set-cookie'];
    if (!setCookie) return;

    const cookieList = Array.isArray(setCookie) ? setCookie : [setCookie];
    for (const raw of cookieList) {
      const parts = raw.split(';')[0].split('=');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        this.cookieJar.set(name, value);
      }
    }
  }

  /**
   * Execute raw TLS HTTP Request with browser fingerprinting
   */
  public async request<T = any>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      headers?: Record<string, string>;
      json?: any;
      body?: string | Buffer;
      responseType?: 'json' | 'text' | 'buffer';
      proxyUrl?: string;
      timeoutMs?: number;
    } = {}
  ): Promise<{ body: T; statusCode: number; headers: http.IncomingHttpHeaders; metrics: RequestMetrics }> {
    const startTime = Date.now();
    const effectiveProxy = options.proxyUrl || this.proxyUrl;

    const requestHeaders: Record<string, string> = {
      'User-Agent': this.userAgent,
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Sec-Ch-Ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      ...(options.headers || {}),
    };

    const cookieHeader = this.getCookieHeader();
    if (cookieHeader && !requestHeaders['Cookie']) {
      requestHeaders['Cookie'] = cookieHeader;
    }

    const gotOptions: OptionsInit = {
      method: options.method || 'GET',
      headers: requestHeaders,
      timeout: { request: options.timeoutMs || this.timeoutMs },
      throwHttpErrors: false,
      retry: { limit: 1 },
      headerGeneratorOptions: {
        browsers: [{ name: 'chrome', minVersion: 120, maxVersion: 133 }],
        devices: ['desktop'],
        locales: ['en-US'],
        operatingSystems: ['windows'],
      },
    };

    if (effectiveProxy) {
      gotOptions.proxyUrl = effectiveProxy;
    }

    if (options.json !== undefined) {
      gotOptions.json = options.json;
    } else if (options.body !== undefined) {
      gotOptions.body = options.body;
    }

    try {
      const response: Response<any> = await gotScraping(url, gotOptions);
      this.parseCookiesFromHeaders(response.headers);

      const durationMs = Date.now() - startTime;
      let bodyData: any = response.body;

      if (options.responseType === 'json' && typeof response.body === 'string') {
        try {
          bodyData = JSON.parse(response.body);
        } catch {
          // Keep raw string if JSON parsing fails
        }
      }

      return {
        body: bodyData as T,
        statusCode: response.statusCode,
        headers: response.headers,
        metrics: {
          durationMs,
          statusCode: response.statusCode,
          contentLength: response.rawBody ? response.rawBody.length : 0,
        },
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      throw new Error(`TLS Request to ${url} failed after ${durationMs}ms: ${err.message}`);
    }
  }

  public async get<T = any>(url: string, headers?: Record<string, string>, responseType: 'json' | 'text' = 'json') {
    return this.request<T>(url, { method: 'GET', headers, responseType });
  }

  public async post<T = any>(url: string, payload: any, headers?: Record<string, string>, isJson = true) {
    return this.request<T>(url, {
      method: 'POST',
      headers,
      ...(isJson ? { json: payload } : { body: payload }),
      responseType: 'json',
    });
  }
}
