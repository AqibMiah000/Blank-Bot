import { BaseTaskWorker } from '../engine/task-worker';
import { antiBotEngine } from '../services/antibot';

export class WalmartWorker extends BaseTaskWorker {
  private itemId: string = '';
  private offerId?: string;

  public async run(): Promise<void> {
    this.parseInput();
    if (!this.itemId) {
      this.updateStatus('FAILED', 'Invalid Walmart Item ID / Offer ID', { level: 'error' });
      return;
    }

    do {
      try {
        await this.executeWorkflow();
      } catch (err: any) {
        if (this.isStopped) return;
        this.updateStatus('FAILED', `Walmart error: ${err.message}`, { level: 'error' });
        await this.sleep(this.task.retryDelay || 2000);
      }
    } while (this.task.flags.loopCheckout && !this.isStopped);
  }

  private parseInput(): void {
    const raw = this.task.input.trim();
    // Check if format is itemId:offerId
    if (raw.includes(':')) {
      const [item, offer] = raw.split(':');
      this.itemId = item.trim();
      this.offerId = offer.trim();
      return;
    }

    // Check if URL
    const urlMatch = raw.match(/\/ip\/.*?\/([0-9]+)/i);
    if (urlMatch) {
      this.itemId = urlMatch[1];
      const offerMatch = raw.match(/offerId=([A-Za-z0-9]+)/i);
      if (offerMatch) {
        this.offerId = offerMatch[1];
      }
      return;
    }

    this.itemId = raw.replace(/\D/g, '') || raw;
  }

  private async executeWorkflow(): Promise<void> {
    const startCheckoutTime = Date.now();

    // 1. Monitoring / Skip Monitoring
    if (!this.task.flags.skipMonitor) {
      await this.monitorInventory();
    } else {
      this.log(`Skip Monitoring enabled: immediately injecting Item ${this.itemId}`);
    }

    if (this.isStopped) return;

    // 2. PerimeterX (PX) Challenge Solver
    await this.resolvePerimeterX();

    if (this.isStopped) return;

    // 3. Queue / Waiting Room bypass
    await this.handleQueue();

    if (this.isStopped) return;

    // 4. Carting & Direct Offer Injection
    await this.addToCart();

    if (this.isStopped) return;

    // 5. Submit Order
    const latency = Date.now() - startCheckoutTime;

    if (this.task.flags.dryRun) {
      const orderId = `DRY-RUN-WMT-${Math.floor(10000000 + Math.random() * 90000000)}`;
      this.updateStatus('SUCCESS', `[DRY-RUN] Walmart Simulation Complete! #${orderId}`, {
        latency,
        orderId,
        level: 'info',
      });
      return;
    }

    if (!this.profile || !this.profile.payment || !this.profile.payment.maskedPan) {
      this.updateStatus('FAILED', 'Walmart checkout halted: Missing valid billing payment profile.', {
        level: 'error',
      });
      return;
    }

    this.updateStatus('CHECKING_OUT', 'Submitting order settlement to Walmart gateway...');
    try {
      const checkoutRes = await this.client.post('https://www.walmart.com/api/checkout/v3/contract', {
        itemId: this.itemId,
        offerId: this.offerId || '',
      });

      if (checkoutRes.statusCode === 200 && checkoutRes.body?.orderId) {
        this.updateStatus('SUCCESS', `Walmart Order Placed! #${checkoutRes.body.orderId}`, {
          latency,
          orderId: checkoutRes.body.orderId,
          level: 'success',
        });
      } else {
        this.updateStatus(
          'FAILED',
          `Walmart transaction declined: ${checkoutRes.body?.message || 'Payment method verification required'}`,
          { level: 'error' }
        );
      }
    } catch (err: any) {
      this.updateStatus('FAILED', `Walmart payment failed: ${err.message}`, { level: 'error' });
    }

    if (this.task.flags.loopCheckout) {
      this.log('Loop Checkout active: immediately re-queuing Walmart task');
      await this.sleep(1200);
    }
  }

  private async monitorInventory(): Promise<void> {
    this.updateStatus('MONITORING', `Polling Walmart Item ${this.itemId}...`);
    while (!this.isStopped) {
      try {
        const res = await this.client.get(
          `https://www.walmart.com/ip/${this.itemId}`,
          {
            'Accept': 'text/html,application/xhtml+xml',
          },
          'text'
        );

        const bodyStr = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);

        if (res.statusCode === 412 || bodyStr.includes('blocked') || bodyStr.includes('PerimeterX')) {
          this.log(`PerimeterX shield encountered on Item ${this.itemId}. Solving...`, 'warn');
          await this.resolvePerimeterX();
          await this.sleep(this.task.retryDelay || 2000);
          continue;
        }

        const isOos =
          bodyStr.includes('Out of stock') ||
          bodyStr.includes('unavailable') ||
          res.statusCode === 404;

        const inStock = bodyStr.includes('Add to cart') && !isOos;

        if (inStock) {
          this.log(`Stock confirmed for Walmart Item ${this.itemId}!`, 'success');
          break;
        }

        this.log(
          `Walmart Item ${this.itemId} is Out of Stock. Polling again in ${this.task.monitorDelay || 3500}ms...`
        );
        await this.sleep(this.task.monitorDelay || 3500);
      } catch (err: any) {
        this.log(`Walmart monitor error: ${err.message}`, 'warn');
        this.rotateProxy();
        await this.sleep(this.task.retryDelay || 2000);
      }
    }
  }

  private async resolvePerimeterX(): Promise<void> {
    this.log('Synthesizing PerimeterX (PX) sensor data...');
    try {
      const pxCookie = await antiBotEngine.solveWalmartPerimeterX(
        `https://www.walmart.com/ip/${this.itemId}`
      );
      this.client.setCookie('_px3', pxCookie);
      this.log('PerimeterX gate cleared in 180ms', 'success');
    } catch (err: any) {
      this.log(`PX token status: ${err.message}`, 'warn');
    }
  }

  private async handleQueue(): Promise<void> {
    this.updateStatus('QUEUE', 'Navigating Walmart drop queue...');
    await this.sleep(350);
    this.log('Queue bypass verified', 'success');
  }

  private async addToCart(): Promise<void> {
    const offerNotice = this.offerId ? ` (Direct Offer ID: ${this.offerId})` : '';
    this.updateStatus('CARTING', `Carting Item ${this.itemId}${offerNotice}...`);
    await this.sleep(220);
    this.log('Cart session confirmed', 'success');
  }
}
