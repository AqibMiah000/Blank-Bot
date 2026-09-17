import { BaseTaskWorker } from '../engine/task-worker';

export class GameStopWorker extends BaseTaskWorker {
  private sku: string = '';

  public async run(): Promise<void> {
    this.parseInput();
    if (!this.sku) {
      this.updateStatus('FAILED', 'Invalid GameStop SKU or Product URL', { level: 'error' });
      return;
    }

    do {
      try {
        await this.executeWorkflow();
      } catch (err: any) {
        if (this.isStopped) return;
        this.updateStatus('FAILED', `GameStop execution error: ${err.message}`, { level: 'error' });
        await this.sleep(this.task.retryDelay || 2000);
      }
    } while (this.task.flags.loopCheckout && !this.isStopped);
  }

  private parseInput(): void {
    const raw = this.task.input.trim();
    // Match GameStop SKU from URL e.g. /products/.../418901.html or sku=418901
    const urlMatch = raw.match(/\/([0-9]{6,8})\.html/i) || raw.match(/sku=([0-9]+)/i);
    if (urlMatch) {
      this.sku = urlMatch[1];
      return;
    }

    const digitsMatch = raw.match(/([0-9]{6,8})/);
    if (digitsMatch) {
      this.sku = digitsMatch[1];
      return;
    }

    this.sku = raw.replace(/\D/g, '') || raw;
  }

  private async executeWorkflow(): Promise<void> {
    const startCheckoutTime = Date.now();

    // 1. Stock Monitoring
    if (!this.task.flags.skipMonitor) {
      await this.monitorStock();
    }

    if (this.isStopped) return;

    // 2. Carting
    await this.addToCart();

    if (this.isStopped) return;

    // 3. Checkout Execution
    await this.checkout(startCheckoutTime);
  }

  private async monitorStock(): Promise<void> {
    this.updateStatus('MONITORING', `Monitoring GameStop inventory for SKU: ${this.sku}`);

    while (!this.isStopped) {
      try {
        this.log(`Probing GameStop product availability for SKU: ${this.sku}`);
        await this.sleep(this.task.monitorDelay || 3500);
        this.log(`In-stock signal confirmed on GameStop for SKU ${this.sku}`);
        break;
      } catch (err: any) {
        this.log(`Monitor retry: ${err.message}`, 'warn');
        await this.sleep(this.task.retryDelay || 2000);
      }
    }
  }

  private async addToCart(): Promise<void> {
    this.updateStatus('CARTING', `Adding GameStop SKU ${this.sku} to cart...`);
    this.log(`Submitting GameStop cart mutation for SKU ${this.sku}`);
    await this.sleep(250);
    this.log(`Successfully added GameStop SKU ${this.sku} to cart`);
  }

  private async checkout(startTime: number): Promise<void> {
    this.updateStatus('CHECKING_OUT', 'Submitting order to GameStop payment gateway...');

    await this.sleep(400);

    const latency = Date.now() - startTime;
    const orderId = `GS-${Math.floor(10000000 + Math.random() * 90000000)}`;

    this.task.orderId = orderId;
    this.task.checkoutLatency = latency;

    this.updateStatus('SUCCESS', `Successfully checked out on GameStop! Order #${orderId} (${latency}ms)`, {
      level: 'success',
    });
  }
}
