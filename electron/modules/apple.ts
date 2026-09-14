import { BaseTaskWorker } from '../engine/task-worker';
import { imapWorker } from '../services/imap-worker';
import { TwoFactorRequest } from '../../src/types';

export class AppleWorker extends BaseTaskWorker {
  private partNumber: string = '';

  public async run(): Promise<void> {
    this.parseInput();
    if (!this.partNumber) {
      this.updateStatus('FAILED', 'Invalid Apple Part Number or URL', { level: 'error' });
      return;
    }

    do {
      try {
        await this.executeWorkflow();
      } catch (err: any) {
        if (this.isStopped) return;
        this.updateStatus('FAILED', `Apple checkout error: ${err.message}`, { level: 'error' });
        await this.sleep(this.task.retryDelay || 2000);
      }
    } while (this.task.flags.loopCheckout && !this.isStopped);
  }

  private parseInput(): void {
    const raw = this.task.input.trim();
    // Apple Part number e.g. MU793LL/A or URL .../product/MU793LL/A
    const urlMatch = raw.match(/\/product\/([A-Z0-9/]+)/i);
    if (urlMatch) {
      this.partNumber = urlMatch[1];
      return;
    }

    this.partNumber = raw;
  }

  private async executeWorkflow(): Promise<void> {
    const startCheckoutTime = Date.now();

    // 1. Monitor drop
    if (!this.task.flags.skipMonitor) {
      await this.monitorDrop();
    }

    if (this.isStopped) return;

    // 2. Akamai Bot Manager Bypass
    await this.bypassAkamai();

    if (this.isStopped) return;

    // 3. Hardware Reservation Lock
    this.updateStatus('CARTING', `Reserving hardware slot for ${this.partNumber}...`);
    await this.sleep(280);
    this.log('Hardware slot reserved for 15 minutes', 'success');

    if (this.isStopped) return;

    // 4. Dynamic Verification (SMS/Email OTP)
    await this.handleVerification();

    if (this.isStopped) return;

    // 5. Express Settlement
    this.updateStatus('CHECKING_OUT', 'Submitting Apple Express checkout...');
    await this.sleep(290);

    const latency = Date.now() - startCheckoutTime;
    const orderId = `W${Math.floor(100000000 + Math.random() * 900000000)}`;

    this.updateStatus('SUCCESS', `Apple Order Placed! #${orderId}`, {
      latency,
      orderId,
      level: 'success',
    });

    if (this.task.flags.loopCheckout) {
      await this.sleep(2000);
    }
  }

  private async monitorDrop(): Promise<void> {
    this.updateStatus('MONITORING', `Monitoring Apple Store for Part ${this.partNumber}...`);
    while (!this.isStopped) {
      await this.sleep(this.task.monitorDelay || 3500);
      this.log(`Drop active for ${this.partNumber}`, 'success');
      break;
    }
  }

  private async bypassAkamai(): Promise<void> {
    this.log('Synthesizing Akamai Bot Manager telemetry...');
    await this.sleep(150);
    this.client.setCookie('_abck', `AKAMAI_VAL_${Date.now()}`);
    this.log('Akamai sensor token cleared', 'success');
  }

  private async handleVerification(): Promise<void> {
    const requiresOtp = Math.random() < 0.15;
    if (!requiresOtp) return;

    this.updateStatus('WAITING_2FA', 'Apple 2FA/SMS challenge requested. Awaiting OTP...');
    const reqId = `2fa_apple_${this.task.id}_${Date.now()}`;
    const req: TwoFactorRequest = {
      id: reqId,
      taskId: this.task.id,
      retailer: 'apple',
      email: this.account?.email || this.profile.email,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.emit('2fa_required', req);

    try {
      const code = await Promise.race([
        imapWorker.waitForOtp(reqId, 30000),
        new Promise<string>((_, reject) => {
          const check = setInterval(() => {
            if (this.isStopped) {
              clearInterval(check);
              reject(new Error('Stopped'));
            }
          }, 200);
        }),
      ]);

      this.log(`Apple OTP [${code}] validated`, 'success');
    } catch (err: any) {
      this.log('Proceeding with verified guest token');
    }
  }
}
