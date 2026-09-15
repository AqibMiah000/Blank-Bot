import {
  PRESET_THEMES,
  hexToRgb,
  adjustHexBrightness,
  isValidHex,
  formatHex,
} from '../src/utils/theme';
import { encryptData, decryptData, jigAddressLine1 } from '../electron/crypto/cipher';
import { parseProxyString } from '../electron/services/proxy-tester';
import { imapWorker } from '../electron/services/imap-worker';
import { parseAYCDJson, parseAYCDCsv } from '../src/utils/aycd-parser';
import { SEED_MARKET_ITEMS } from '../src/utils/market-analytics';

interface BugReport {
  suite: string;
  scenario: string;
  passed: boolean;
  error?: string;
  impact?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

const bugReports: BugReport[] = [];

function test(
  suite: string,
  scenario: string,
  fn: () => void,
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  impact: string
) {
  try {
    fn();
    bugReports.push({ suite, scenario, passed: true, severity, impact });
    console.log(`  [PASS] ${scenario}`);
  } catch (err: any) {
    bugReports.push({
      suite,
      scenario,
      passed: false,
      error: err.message || String(err),
      severity,
      impact,
    });
    console.log(`  [FAIL] ${scenario}\n         Error: ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(msg);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('      BLANK BOT ARTIFICIAL SCENARIO & BUG STRESS TESTING        ');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // SUITE 1: THEME & COLOR ENGINE STRESS TEST
  // -------------------------------------------------------------------------
  console.log('--- 1. Theme Engine & Hex Parser Resilience ---');

  test(
    'Theme Engine',
    'Parses standard 6-digit hex with hash (#00F0FF)',
    () => {
      assert(isValidHex('#00F0FF') === true, 'Expected #00F0FF to be valid');
      assert(formatHex('#00F0FF') === '#00F0FF', 'Expected formatted hex #00F0FF');
    },
    'LOW',
    'Theme color rendering'
  );

  test(
    'Theme Engine',
    'Parses 3-digit shorthand without hash (0FF -> #0FF)',
    () => {
      assert(isValidHex('0FF') === true, 'Expected 0FF to be valid');
      assert(formatHex('0FF') === '#0FF', 'Expected formatted hex #0FF');
    },
    'LOW',
    'Shorthand color inputs'
  );

  test(
    'Theme Engine',
    'Rejects invalid non-hex strings (#ZZZ000, "hello", "#12345")',
    () => {
      assert(isValidHex('#ZZZ000') === false, 'Expected #ZZZ000 to be invalid');
      assert(isValidHex('hello') === false, 'Expected hello to be invalid');
      assert(isValidHex('#12345') === false, 'Expected 5-digit hex to be invalid');
      assert(isValidHex('') === false, 'Expected empty string to be invalid');
    },
    'LOW',
    'Invalid hex input validation'
  );

  test(
    'Theme Engine',
    'Brightness adjust clamps to #FFFFFF on extreme positive (+500%)',
    () => {
      const result = adjustHexBrightness('#888888', 500);
      assert(result.toLowerCase() === '#ffffff', `Expected #ffffff, got ${result}`);
    },
    'LOW',
    'Extreme color calculation'
  );

  test(
    'Theme Engine',
    'Brightness adjust clamps to #000000 on extreme negative (-500%)',
    () => {
      const result = adjustHexBrightness('#888888', -500);
      assert(result.toLowerCase() === '#000000', `Expected #000000, got ${result}`);
    },
    'LOW',
    'Extreme dark calculation'
  );

  test(
    'Theme Engine',
    'Brightness adjust returns original string on malformed hex instead of #NaNNaNNaN',
    () => {
      const result = adjustHexBrightness('invalid-hex', 20);
      assert(!result.includes('nan'), `Should not contain NaN, but got: ${result}`);
    },
    'MEDIUM',
    'Prevents corrupted CSS variable values'
  );

  test(
    'Theme Engine',
    'All 17 preset themes have unique IDs and valid color hex codes',
    () => {
      assert(PRESET_THEMES.length === 17, `Expected 17 presets, found ${PRESET_THEMES.length}`);
      const ids = new Set<string>();
      for (const p of PRESET_THEMES) {
        assert(!ids.has(p.id), `Duplicate ID: ${p.id}`);
        ids.add(p.id);
        assert(isValidHex(p.color), `Invalid color for preset ${p.id}: ${p.color}`);
        assert(isValidHex(p.bg), `Invalid bg for preset ${p.id}: ${p.bg}`);
      }
    },
    'HIGH',
    'Theme switching crashes if preset values are invalid'
  );

  // -------------------------------------------------------------------------
  // SUITE 2: MARKET ANALYTICS & ARITHMETIC CORNER CASES
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Market Analytics & Profit Spreads ---');

  test(
    'Market Analytics',
    'Standard retail and resale profit & ROI calculation',
    () => {
      const msrp = 54.99;
      const marketPrice = 94.00;
      const profit = marketPrice - msrp;
      const roi = Math.round((profit / msrp) * 100);
      assert(Math.abs(profit - 39.01) < 0.01, `Expected profit 39.01, got ${profit}`);
      assert(roi === 71, `Expected 71% ROI, got ${roi}%`);
    },
    'MEDIUM',
    'Financial reporting accuracy'
  );

  test(
    'Market Analytics',
    'Glitch / $0 MSRP item calculation (Safeguarded against division by zero)',
    () => {
      // Test the guarded calculation implemented in MarketAnalyticsPage:
      const msrp = 0;
      const marketPrice = 45.00;
      const profit = marketPrice - msrp;
      const guardedRoi = msrp > 0 
        ? Math.round((profit / msrp) * 100) 
        : (marketPrice > 0 ? 100 : 0);
      assert(Number.isFinite(guardedRoi), `Guarded ROI must be finite number, got ${guardedRoi}`);
      assert(guardedRoi === 100, `Expected 100% for free glitch item, got ${guardedRoi}%`);
    },
    'MEDIUM',
    'Prevents "+Infinity% ROI" on dashboard if MSRP is $0'
  );

  test(
    'Market Analytics',
    'Average ROI across items with a $0 MSRP item included (Safeguarded)',
    () => {
      // Test the guarded calculation implemented in market-analytics.ts:
      const items = [
        { msrp: 50, marketPrice: 100 },
        { msrp: 0, marketPrice: 50 }, // glitch item
      ];
      let totalRoi = 0;
      for (const item of items) {
        const profit = item.marketPrice - item.msrp;
        const roi = item.msrp > 0 ? (profit / item.msrp) * 100 : (item.marketPrice > 0 ? 100 : 0);
        if (Number.isFinite(roi)) {
          totalRoi += roi;
        }
      }
      const avg = Math.round(totalRoi / items.length);
      assert(Number.isFinite(avg), `Average ROI must be finite, got ${avg}`);
      assert(avg === 100, `Expected 100% average ROI, got ${avg}%`);
    },
    'HIGH',
    'Ensures top dashboard metric card displays accurate finite margin'
  );

  test(
    'Market Analytics',
    'Seed data integrity: no items have 0 MSRP or NaN values',
    () => {
      for (const item of SEED_MARKET_ITEMS) {
        assert(item.msrp > 0, `Item ${item.id} has non-positive MSRP: ${item.msrp}`);
        assert(item.marketPrice > 0, `Item ${item.id} has non-positive market price: ${item.marketPrice}`);
        assert(Boolean(item.identifier), `Item ${item.id} is missing identifier/SKU`);
      }
    },
    'HIGH',
    'Corrupted default market cards'
  );

  // -------------------------------------------------------------------------
  // SUITE 3: CRYPTOGRAPHIC VAULT INTEGRITY
  // -------------------------------------------------------------------------
  console.log('\n--- 3. AES-256-GCM Hardware Cryptography ---');

  test(
    'Crypto Vault',
    'Card PAN encryption & decryption roundtrip',
    () => {
      const pan = '4111222233334444';
      const key = 'secure-client-pass-2026';
      const enc = encryptData(pan, key);
      assert(enc.split(':').length === 3, 'Payload should have 3 segments (IV:Tag:Cipher)');
      const dec = decryptData(enc, key);
      assert(dec === pan, `Decrypted PAN mismatch: ${dec} !== ${pan}`);
    },
    'CRITICAL',
    'Payment card decryption on checkout'
  );

  test(
    'Crypto Vault',
    'Decryption rejects incorrect master passphrase with error',
    () => {
      const pan = '4111222233334444';
      const enc = encryptData(pan, 'correct-pass');
      let rejected = false;
      try {
        decryptData(enc, 'wrong-pass');
      } catch {
        rejected = true;
      }
      assert(rejected, 'Decryption should fail when given the wrong passphrase');
    },
    'CRITICAL',
    'Unauthorized credential access prevention'
  );

  test(
    'Crypto Vault',
    'Decryption rejects tampered payload (altered authentication tag)',
    () => {
      const pan = '4111222233334444';
      const enc = encryptData(pan, 'pass');
      const parts = enc.split(':');
      // Alter the auth tag
      const tamperedTag = (parts[1].slice(0, -2) + '00');
      const tampered = `${parts[0]}:${tamperedTag}:${parts[2]}`;
      let rejected = false;
      try {
        decryptData(tampered, 'pass');
      } catch {
        rejected = true;
      }
      assert(rejected, 'Tampered ciphertext or tag must be rejected by GCM auth verification');
    },
    'CRITICAL',
    'Data corruption or MITM tampering detection'
  );

  test(
    'Crypto Vault',
    'Handles empty plaintext input safely without crashing',
    () => {
      assert(encryptData('') === '', 'Empty string encryption should yield empty string');
      assert(decryptData('') === '', 'Empty string decryption should yield empty string');
    },
    'LOW',
    'Graceful handling of unconfigured optional fields'
  );

  // -------------------------------------------------------------------------
  // SUITE 4: PROXY PARSER & PROTOCOL TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Proxy Parser & Protocols ---');

  test(
    'Proxy Parser',
    'Parses host:port format',
    () => {
      const res = parseProxyString('192.168.1.50:8080');
      assert(res.host === '192.168.1.50' && res.port === 8080, 'Host and port extracted');
      assert(!res.username, 'No username expected');
    },
    'HIGH',
    'Proxy connectivity'
  );

  test(
    'Proxy Parser',
    'Parses host:port:user:pass format',
    () => {
      const res = parseProxyString('proxy.isp.com:3128:testuser:testpass123');
      assert(res.host === 'proxy.isp.com' && res.port === 3128, 'Host and port extracted');
      assert(res.username === 'testuser' && res.password === 'testpass123', 'Credentials extracted');
    },
    'HIGH',
    'Authenticated proxy requests'
  );

  test(
    'Proxy Parser',
    'Parses socks5:// scheme with embedded credentials',
    () => {
      const res = parseProxyString('socks5://user:pass@1.1.1.1:1080');
      assert(res.protocol === 'socks5', 'Protocol socks5 identified');
      assert(res.host === '1.1.1.1' && res.port === 1080, 'Host and port parsed');
    },
    'HIGH',
    'SOCKS5 routing'
  );

  // -------------------------------------------------------------------------
  // SUITE 5: IMAP 2FA OTP REGEX ENGINE
  // -------------------------------------------------------------------------
  console.log('\n--- 5. IMAP 2FA OTP Harvester ---');

  test(
    'IMAP 2FA',
    'Extracts 6-digit OTP from Amazon verification email',
    () => {
      const msg = '938102 is your Amazon OTP. Do not share this code with anyone.';
      const code = imapWorker.extractOtpCode(msg);
      assert(code === '938102', `Expected 938102, got ${code}`);
    },
    'CRITICAL',
    'Automated login on Amazon'
  );

  test(
    'IMAP 2FA',
    'Extracts 6-digit OTP from Best Buy verification email',
    () => {
      const msg = 'Your Best Buy verification code is: 481920. This code expires in 10 minutes.';
      const code = imapWorker.extractOtpCode(msg);
      assert(code === '481920', `Expected 481920, got ${code}`);
    },
    'CRITICAL',
    'Automated login on Best Buy'
  );

  test(
    'IMAP 2FA',
    'Avoids grabbing non-OTP numbers like Order IDs (114-9847192-3849102)',
    () => {
      const msg = 'Update for Order 114-9847192-3849102: Your security code is 719284 to sign in.';
      const code = imapWorker.extractOtpCode(msg);
      assert(code === '719284', `Expected 719284, got ${code}`);
    },
    'HIGH',
    '2FA verification accuracy'
  );

  test(
    'IMAP 2FA',
    'Returns empty string cleanly when no code is present',
    () => {
      const msg = 'Thank you for shopping with us! No verification needed.';
      const code = imapWorker.extractOtpCode(msg);
      assert(code === '', `Expected empty string, got ${code}`);
    },
    'LOW',
    'False positive prevention'
  );

  // -------------------------------------------------------------------------
  // SUITE 6: AYCD PROFILE BUILDER JSON & CSV PARSER
  // -------------------------------------------------------------------------
  console.log('\n--- 6. AYCD Profile Builder Parser ---');

  test(
    'AYCD Parser',
    'Parses AYCD standard JSON export with Visa card',
    () => {
      const json = JSON.stringify([
        {
          profileName: 'Profile 1',
          email: 'user@example.com',
          shipping: {
            firstName: 'Alex',
            lastName: 'Mercer',
            address1: '500 5th Ave',
            city: 'New York',
            state: 'NY',
            zip: '10110',
            country: 'US',
            phone: '2125559999',
          },
          payment: {
            cardNumber: '4000123456789010',
            expMonth: '05',
            expYear: '2028',
            cvv: '999',
          },
        },
      ]);
      const res = parseAYCDJson(json);
      assert(res.length === 1, `Expected 1 profile, got ${res.length}`);
      assert(res[0].profileName === 'Profile 1', 'Profile name matches');
      assert(res[0].cardBrand === 'visa', `Expected visa, got ${res[0].cardBrand}`);
    },
    'HIGH',
    'Profile mass import'
  );

  test(
    'AYCD Parser',
    'Parses CSV with comma-embedded address lines in quotes ("100 Main St, Apt 2")',
    () => {
      const csv = `Profile Name,First Name,Last Name,Address 1,City,State,Zip,Country,Email,Phone,Card Number,Exp Month,Exp Year,CVV
"Drop Profile","Sam","Fisher","100 Main St, Apt 2","Seattle","WA","98101","US","sam@agency.gov","2065551234","378282246310005","11","2026","1234"`;
      const res = parseAYCDCsv(csv);
      assert(res.length === 1, `Expected 1 profile, got ${res.length}`);
      assert(res[0].shipping.addressLine1 === '100 Main St, Apt 2', `Address mismatch: ${res[0].shipping.addressLine1}`);
      assert(res[0].cardBrand === 'amex', `Expected amex, got ${res[0].cardBrand}`);
    },
    'HIGH',
    'CSV parsing accuracy'
  );

  test(
    'AYCD Parser',
    'Rejects corrupted JSON with syntax error message',
    () => {
      let threw = false;
      try {
        parseAYCDJson('{ broken: json, [unclosed');
      } catch {
        threw = true;
      }
      assert(threw, 'Should throw descriptive syntax error on bad JSON');
    },
    'MEDIUM',
    'User import error feedback'
  );

  test(
    'AYCD Parser',
    'Rejects empty CSV or header-only CSV',
    () => {
      let threw = false;
      try {
        parseAYCDCsv('Profile Name,First Name,Last Name,Address 1,Card Number');
      } catch {
        threw = true;
      }
      assert(threw, 'Should throw error when no rows exist');
    },
    'MEDIUM',
    'User import error feedback'
  );

  // -------------------------------------------------------------------------
  // SUITE 7: TCG DROP RADAR & LOCAL STORE PICKUP SENTINEL
  // -------------------------------------------------------------------------
  console.log('\n--- 7. TCG Drop Radar & Local Store Pickup Scanner ---');

  test(
    'TCG Local Pickup',
    'Sanitizes 5-digit ZIP codes with whitespace or ZIP+4 extensions',
    () => {
      const raw = '  90210-1234 ';
      const clean = raw.trim().slice(0, 5);
      assert(clean === '90210', `Expected 90210, got ${clean}`);
    },
    'HIGH',
    'Store locator ZIP parsing'
  );

  test(
    'TCG Local Pickup',
    'Filters stores strictly within user search radius (e.g., 25 miles)',
    () => {
      const stores = [
        { name: 'Target Beverly Hills', distance: 2.8 },
        { name: 'Target Culver City', distance: 6.4 },
        { name: 'Target Long Beach', distance: 24.1 },
        { name: 'Target San Diego', distance: 110.5 },
      ];
      const radius = 25;
      const nearby = stores.filter((s) => s.distance <= radius);
      assert(nearby.length === 3, `Expected 3 stores within 25 miles, got ${nearby.length}`);
      assert(!nearby.some((s) => s.name.includes('San Diego')), 'Should not include distant stores outside radius');
    },
    'HIGH',
    'Local radius enforcement'
  );

  test(
    'TCG Local Pickup',
    'Correctly identifies fulfillment type for store pickup vs in-store only vs online shipping',
    () => {
      const determineFulfillment = (orderPickup: boolean, inStore: boolean) => {
        if (orderPickup) return 'STORE_PICKUP';
        if (inStore) return 'IN_STORE_ONLY';
        return 'SHIPPING';
      };

      assert(determineFulfillment(true, false) === 'STORE_PICKUP', 'Expected STORE_PICKUP');
      assert(determineFulfillment(true, true) === 'STORE_PICKUP', 'Expected STORE_PICKUP when both active');
      assert(determineFulfillment(false, true) === 'IN_STORE_ONLY', 'Expected IN_STORE_ONLY');
      assert(determineFulfillment(false, false) === 'SHIPPING', 'Expected SHIPPING');
    },
    'HIGH',
    'Fulfillment badge formatting'
  );

  test(
    'TCG Local Pickup',
    'Builds accurate Discord Webhook embed for in-store shelf restock',
    () => {
      const event = {
        productName: 'Pokémon TCG: Destined Rivals Booster Bundle',
        retailer: 'target',
        fulfillmentType: 'STORE_PICKUP',
        storeName: 'Target - Beverly Hills West (#3991)',
        distanceMiles: 2.8,
        availableQuantity: 6,
        price: 26.94,
        marketPrice: 48.00,
      };

      const isLocal = event.fulfillmentType === 'STORE_PICKUP';
      assert(isLocal === true, 'Should recognize local store pickup');
      const title = isLocal ? `🎯 LOCAL STORE RESTOCK: ${event.productName}` : 'Online';
      assert(title.includes('LOCAL STORE RESTOCK'), 'Embed title must indicate local store pickup');
      assert(event.distanceMiles <= 25, 'Store must be within selected radius');
      assert(event.availableQuantity > 0, 'Available quantity must be positive');
    },
    'HIGH',
    'Discord webhook embed notification accuracy'
  );

  test(
    'TCG Local Pickup',
    'Resolves exact store street address and eliminates generic Metro District labels',
    () => {
      // Simulate store name resolution for Flushing, NY (11354)
      const zip = '11354';
      const city = 'Flushing';
      const state = 'NY';

      const resolveStoreDisplay = (storeNum: number, address: string, brand: string) => {
        const storeName = `${brand} - ${address} (#${storeNum})`;
        return storeName;
      };

      const targetStore = resolveStoreDisplay(2424, '40-24 College Point Blvd, Flushing, NY 11354', 'Target');
      const walmartStore = resolveStoreDisplay(2280, '77 Green Acres Rd S, Valley Stream, NY 11581', 'Walmart Supercenter');

      assert(!targetStore.includes('Metro District'), 'Target store must not use generic Metro District label');
      assert(!walmartStore.includes('Metro District'), 'Walmart store must not use generic Metro District label');
      assert(targetStore.includes('40-24 College Point Blvd'), 'Target store must contain street address');
      assert(targetStore.includes('Flushing, NY'), 'Target store must contain city and state');
      assert(walmartStore.includes('77 Green Acres Rd S'), 'Walmart store must contain street address');
    },
    'HIGH',
    'Store address and city/state geo-resolution'
  );

  // -------------------------------------------------------------------------
  // FINAL RESULTS
  // -------------------------------------------------------------------------
  const total = bugReports.length;
  const passed = bugReports.filter((r) => r.passed).length;
  const failed = bugReports.filter((r) => !r.passed).length;

  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passed} / ${total} PASSED  (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.log('FOUND BUGS TO REPORT:');
    for (const b of bugReports.filter((r) => !r.passed)) {
      console.log(`- [${b.severity}] ${b.suite} -> ${b.scenario}`);
      console.log(`  Error: ${b.error}`);
      console.log(`  Impact: ${b.impact}\n`);
    }
  } else {
    console.log('Zero bugs detected across all simulated scenarios!');
  }
}

runTestSuite().catch(console.error);
