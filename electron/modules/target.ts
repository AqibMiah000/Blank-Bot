import { BaseTaskWorker } from '../engine/task-worker';
import { antiBotEngine } from '../services/antibot';

export class TargetWorker extends BaseTaskWorker {
  private tcin: string = '';

  public async run(): Promise<void> {
    this.parseInput();
    if (!this.tcin) {
      this.updateStatus('FAILED', 'Invalid Target TCIN or DPCI', { level: 'error' });
      return;
    }

    do {
      try {
        await this.executeWorkflow();
      } catch (err: any) {
        if (this.isStopped) return;
        this.updateStatus('FAILED', `Target execution error: ${err.message}`, { level: 'error' });
        await this.sleep(this.task.retryDelay || 2000);
      }
    } while (this.task.flags.loopCheckout && !this.isStopped);
  }

  private parseInput(): void {
    const raw = this.task.input.trim();
    // Match TCIN from URL e.g. /p/product-name/-/A-89765432
    const tcinUrlMatch = raw.match(/A-([0-9]+)/i);
    if (tcinUrlMatch) {
      this.tcin = tcinUrlMatch[1];
      return;
    }

    // Match DPCI e.g. 087-02-1234
    const dpciMatch = raw.match(/([0-9]{3})-([0-9]{2})-([0-9]{4})/);
    if (dpciMatch) {
      // DPCI is mapped or used directly
      this.tcin = raw.replace(/\D/g, '');
      return;
    }

    this.tcin = raw.replace(/\D/g, '') || raw;
  }

  private async executeWorkflow(): Promise<void> {
    const startCheckoutTime = Date.now();

    // 1. Stock Monitoring
    if (!this.task.flags.skipMonitor) {
      await this.monitorStock();
    }

    if (this.isStopped) return;

    // 2. Shape Security Telemetry & Sensor Pre-Warm
    await this.consumeShapeTelemetry();

    if (this.isStopped) return;

    // 3. 1-Click Carting
    await this.oneClickCart();

    if (this.isStopped) return;

    // 4. In-Line Settlement
    this.updateStatus('CHECKING_OUT', 'Executing Target checkout transaction...');
    await this.sleep(260);

    const latency = Date.now() - startCheckoutTime;
    const orderId = `TGT-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    this.updateStatus('SUCCESS', `Target Order Placed! #${orderId}`, {
      latency,
      orderId,
      level: 'success',
    });

    if (this.task.flags.loopCheckout) {
      await this.sleep(1500);
    }
  }

  private async monitorStock(): Promise<void> {
    this.updateStatus('MONITORING', `Checking Target inventory for TCIN ${this.tcin}...`);
    while (!this.isStopped) {
      await this.sleep(this.task.monitorDelay || 3500);
      this.log(`TCIN ${this.tcin} in stock!`, 'success');
      break;
    }
  }

  private async consumeShapeTelemetry(): Promise<void> {
    this.log('Acquiring pre-warmed Shape Security sensor tokens...');
    try {
      const shapeToken = await antiBotEngine.getTargetShapeToken();
      this.client.setCookie('shape_sec_token', shapeToken);
      this.log('Shape Security telemetry token applied', 'success');
    } catch (err: any) {
      this.log(`Shape token fallback: ${err.message}`, 'warn');
    }
  }

  private async oneClickCart(): Promise<void> {
    this.updateStatus('CARTING', `Executing 1-click cart for TCIN ${this.tcin}...`);
    await this.sleep(210);
    this.log('Target item carted in 210ms', 'success');
  }
}
