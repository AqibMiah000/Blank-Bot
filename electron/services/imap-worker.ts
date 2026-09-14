import EventEmitter from 'events';
import { ImapFlow } from 'imapflow';
import { TwoFactorRequest } from '../../src/types';

export interface IMAPCredentials {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class IMAPWorker extends EventEmitter {
  private client: ImapFlow | null = null;
  private isConnected: boolean = false;
  private isScanning: boolean = false;
  private activeCredentials: IMAPCredentials | null = null;
  private pendingRequests: Map<string, (code: string) => void> = new Map();

  constructor() {
    super();
  }

  public getStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (this.isConnected) return 'connected';
    if (this.client) return 'connecting';
    return 'disconnected';
  }

  /**
   * Connect to IMAP server (e.g. imap.gmail.com:993 or outlook.office365.com:993)
   */
  public async connect(credentials: IMAPCredentials): Promise<boolean> {
    this.activeCredentials = credentials;
    try {
      if (this.client) {
        await this.disconnect();
      }

      this.client = new ImapFlow({
        host: credentials.host,
        port: credentials.port,
        secure: credentials.secure,
        auth: credentials.auth,
        logger: false,
      });

      await this.client.connect();
      this.isConnected = true;
      this.emit('status', 'connected');

      // Start background IDLE or mailbox listener
      this.startListening();
      return true;
    } catch (err: any) {
      console.error('IMAP Connection Failed:', err.message);
      this.isConnected = false;
      this.emit('status', 'disconnected');
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.logout();
      } catch {
        // ignore disconnect error
      }
      this.client = null;
      this.isConnected = false;
      this.emit('status', 'disconnected');
    }
  }

  /**
   * Continuous mailbox scanner and IDLE listener
   */
  private async startListening(): Promise<void> {
    if (!this.client || !this.isConnected) return;

    try {
      const lock = await this.client.getMailboxLock('INBOX');
      try {
        this.client.on('exists', async () => {
          await this.scanRecentEmails();
        });
      } finally {
        lock.release();
      }
    } catch (err: any) {
      console.warn('IMAP Listening error:', err.message);
    }
  }

  /**
   * Fast scan (<300ms) for unread verification emails containing 6-digit codes
   */
  public async scanRecentEmails(): Promise<void> {
    if (!this.client || !this.isConnected || this.isScanning) return;
    this.isScanning = true;

    try {
      const lock = await this.client.getMailboxLock('INBOX');
      try {
        const messages = this.client.fetch(
          { seen: false },
          { envelope: true, source: true },
          { uid: true }
        );

        for await (const msg of messages) {
          const rawContent = msg.source ? msg.source.toString('utf8') : '';
          const subject = msg.envelope?.subject || '';
          const from = msg.envelope?.from?.[0]?.address || '';

          const code = this.extractOtpCode(subject + '\n' + rawContent);
          if (code) {
            this.emit('otp_received', {
              code,
              from,
              subject,
              timestamp: Date.now(),
            });

            // If there are pending task resolvers, resolve them immediately
            for (const [reqId, resolver] of this.pendingRequests.entries()) {
              resolver(code);
              this.pendingRequests.delete(reqId);
            }
          }
        }
      } finally {
        lock.release();
      }
    } catch (err: any) {
      console.error('Error during IMAP scan:', err.message);
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * High-speed Regex OTP Parser
   * Evaluates subject & body against high-probability retail OTP signatures
   */
  public extractOtpCode(text: string): string {
    if (!text) return '';

    // Pattern 1: Explicit retail OTP patterns
    const patterns = [
      /(?:code\s*is|security\s*code|verification\s*code|passcode|one-time\s*password|otp\s*is)[:\s]+([0-9]{6})\b/i,
      /\b([0-9]{6})\s+is\s+your\s+(?:Best\s*Buy|Walmart|Target|Amazon|Apple)/i,
      /(?:Best\s*Buy|Walmart|Target|Amazon|Apple)[^0-9]*([0-9]{6})\b/i,
      /\b([0-9]{6})\b/, // Fallback 6-digit number
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Await a 2FA code for a specific task with a timeout, with fallback to manual entry
   */
  public waitForOtp(requestId: string, timeoutMs: number = 60000): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`2FA OTP timed out after ${timeoutMs / 1000}s`));
      }, timeoutMs);

      this.pendingRequests.set(requestId, (code: string) => {
        clearTimeout(timer);
        resolve(code);
      });
    });
  }

  /**
   * Resolve a 2FA request manually from the React 2FA slideout drawer
   */
  public resolveManual2FA(requestId: string, code: string): boolean {
    const resolver = this.pendingRequests.get(requestId);
    if (resolver) {
      resolver(code);
      this.pendingRequests.delete(requestId);
      return true;
    }
    return false;
  }
}

export const imapWorker = new IMAPWorker();
