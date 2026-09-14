import { gotScraping } from 'got-scraping';

export interface CheckoutWebhookPayload {
  title: string;
  sku: string;
  retailer: string;
  price: string;
  profileName: string;
  maskedCard: string;
  latency: number;
  orderId?: string;
  imageUrl?: string;
}

export async function sendDiscordCheckoutWebhook(
  webhookUrl: string,
  data: CheckoutWebhookPayload
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return false;
  }

  const embed = {
    title: '🎉 Checkout Confirmed!',
    description: `Successfully secured **${data.title}** via Blank Bot!`,
    color: 0x10b981, // Emerald Green
    thumbnail: data.imageUrl ? { url: data.imageUrl } : undefined,
    fields: [
      { name: '🛒 Retailer', value: data.retailer.toUpperCase(), inline: true },
      { name: '🏷️ SKU / ID', value: `\`${data.sku}\``, inline: true },
      { name: '💵 Price', value: data.price || 'Market Rate', inline: true },
      { name: '👤 Profile', value: data.profileName, inline: true },
      { name: '💳 Card', value: `\`${data.maskedCard}\``, inline: true },
      { name: '⚡ Latency', value: `\`${data.latency}ms\``, inline: true },
      ...(data.orderId ? [{ name: '📦 Order #', value: `\`${data.orderId}\``, inline: false }] : []),
    ],
    footer: {
      text: 'Blank Bot v1.2.0 • Free & Open-Source Desktop Suite',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await gotScraping.post(webhookUrl, {
      json: {
        username: 'Blank Bot Notifier',
        avatar_url: 'https://raw.githubusercontent.com/blank-bot/assets/main/logo.png',
        embeds: [embed],
      },
      timeout: { request: 5000 },
      throwHttpErrors: false,
    });

    return res.statusCode >= 200 && res.statusCode < 300;
  } catch (err: any) {
    console.error('Failed to dispatch Discord webhook:', err.message);
    return false;
  }
}
