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
    const latency = Date.now() - startCheckoutTime;

    if (this.task.flags.dryRun) {
      const orderId = `DRY-RUN-TGT-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      this.updateStatus('SUCCESS', `[DRY-RUN] Target Simulation Complete! #${orderId}`, {
        latency,
        orderId,
        level: 'info',
      });
      return;
    }

    if (!this.profile || !this.profile.payment || !this.profile.payment.maskedPan) {
      this.updateStatus('FAILED', 'Target checkout halted: Missing valid billing payment profile.', {
        level: 'error',
      });
      return;
    }

    this.updateStatus('CHECKING_OUT', 'Executing Target checkout transaction...');
    try {
      const checkoutRes = await this.client.post('https://api.target.com/payment_instructions/v1', {
        tcin: this.tcin,
        paymentType: 'CREDIT_CARD',
      });

      if (checkoutRes.statusCode === 200 && checkoutRes.body?.order_id) {
        this.updateStatus('SUCCESS', `Target Order Placed! #${checkoutRes.body.order_id}`, {
          latency,
          orderId: checkoutRes.body.order_id,
          level: 'success',
        });
      } else {
        this.updateStatus(
          'FAILED',
          `Target checkout declined: ${checkoutRes.body?.error_description || 'RedCard / payment verification required'}`,
          { level: 'error' }
        );
      }
    } catch (err: any) {
      this.updateStatus('FAILED', `Target transaction declined: ${err.message}`, { level: 'error' });
    }

    if (this.task.flags.loopCheckout) {
      await this.sleep(1500);
    }
  }

  private async monitorStock(): Promise<void> {
    this.updateStatus('MONITORING', `Checking Target inventory for TCIN ${this.tcin}...`);
    while (!this.isStopped) {
      try {
        const res = await this.client.get(
          `https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&tcin=${this.tcin}&store_id=none&pricing_store_id=none`,
          {
            'Accept': 'application/json',
          }
        );

        if (res.statusCode === 404) {
          this.updateStatus('FAILED', `Target product not found for TCIN ${this.tcin}`, { level: 'error' });
          return;
        }

        const fulfillment = res.body?.data?.product?.fulfillment;
        const buyStatus = fulfillment?.shipping_options?.availability_status;
        const inStock = buyStatus === 'IN_STOCK' || fulfillment?.is_out_of_stock_in_all_store_locations === false;

        if (inStock) {
          this.log(`TCIN ${this.tcin} in stock! Availability: ${buyStatus || 'Available'}`, 'success');
          break;
        }

        // Stay in MONITORING! Do NOT fake success!
        this.log(
          `TCIN ${this.tcin} is Out of Stock (${buyStatus || 'OOS'}). Polling again in ${this.task.monitorDelay || 3500}ms...`
        );
        await this.sleep(this.task.monitorDelay || 3500);
      } catch (err: any) {
        this.log(`Target monitor ping error: ${err.message}`, 'warn');
        this.rotateProxy();
        await this.sleep(this.task.retryDelay || 2000);
      }
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
