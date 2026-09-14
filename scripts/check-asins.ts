import { gotScraping } from 'got-scraping';

// Let's test checking if an Amazon DP url returns 200 or 404
const asins = [
  'B0HFBMMSS6', // Samsung S26 FE deal from Slickdeals
  'B0HFB9K6FG', // Samsung S26 FE 128GB
  'B0H2164G7X', // Solar rope lights $8.49
  'B0D1XD1ZV3', // AirPods 4
  'B08FC5L3RG', // DualSense
  'B09B8W5FW7', // Fire TV stick 4K
  'B0CX23V2ZH', // Echo Dot 5th Gen
  'B07YFFA357', // Logitech G502 HERO
  'B0B7CPSN2K', // Anker Power Bank
  'B09V3HMK6B', // Apple iPad 9th Gen
];

async function checkAsins() {
  for (const asin of asins) {
    const url = `https://www.amazon.com/dp/${asin}`;
    try {
      const res = await gotScraping({
        url,
        headerGeneratorOptions: {
          browsers: [{ name: 'chrome', minVersion: 124 }],
          devices: ['desktop'],
          operatingSystems: ['windows'],
        }
      });
      const is404 = res.statusCode === 404 || res.body.includes("couldn't find that page");
      const titleMatch = res.body.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace('Amazon.com:', '').trim() : 'Unknown';
      console.log(`ASIN ${asin} -> Status: ${res.statusCode} | 404 dog page: ${is404} | Title: ${title.slice(0, 45)}`);
    } catch (e: any) {
      console.log(`ASIN ${asin} -> Error: ${e.message}`);
    }
  }
}

checkAsins();
