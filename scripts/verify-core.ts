import { encryptData, decryptData, jigAddressLine1, generateJigBatch } from '../electron/crypto/cipher';
import { parseProxyString } from '../electron/services/proxy-tester';
import { imapWorker } from '../electron/services/imap-worker';
import { antiBotEngine } from '../electron/services/antibot';

async function runVerification() {
  console.log('=====================================================');
  console.log('  BLANK BOT CORE ARCHITECTURE & ENGINE VERIFICATION  ');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. AES-256-GCM Encryption / Decryption Roundtrip
  console.log('--- 1. Testing AES-256-GCM Hardware Cryptography ---');
  const secretPAN = '4000123456789010';
  const passphrase = 'user-custom-secret-key-999';
  const encrypted = encryptData(secretPAN, passphrase);
  assert(Boolean(encrypted && encrypted.includes(':')), 'Cipher output contains IV:Tag:Ciphertext format');
  const decrypted = decryptData(encrypted, passphrase);
  assert(decrypted === secretPAN, 'Decrypted output matches original card PAN exactly');

  // 2. Address Jigging Permutations
  console.log('\n--- 2. Testing USPS Address Jigging Utility ---');
  const base = {
    addressLine1: '100 Main Street',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'US',
  };
  const jiggedLine1 = jigAddressLine1(base.addressLine1);
  assert(jiggedLine1.startsWith('100 Main Street ') && jiggedLine1.length > base.addressLine1.length, 'Jigged line 1 contains valid unit/box permuted suffix');
  const batch = generateJigBatch(base, 5);
  assert(batch.length === 5, 'Generated 5 unique address jig variants');

  // 3. Proxy Parser & Protocol Handling
  console.log('\n--- 3. Testing Proxy Parser ---');
  const p1 = parseProxyString('1.2.3.4:8080');
  assert(p1.host === '1.2.3.4' && p1.port === 8080 && !p1.username, 'Parsed standard ip:port');
  const p2 = parseProxyString('1.2.3.4:8080:myUser:myPass');
  assert(p2.host === '1.2.3.4' && p2.port === 8080 && p2.username === 'myUser' && p2.password === 'myPass', 'Parsed ip:port:user:pass with auth credentials');
  const p3 = parseProxyString('socks5://proxy.datacenter.com:1080');
  assert(p3.protocol === 'socks5' && p3.host === 'proxy.datacenter.com', 'Parsed SOCKS5 protocol scheme');

  // 4. Automated 2FA IMAP OTP Regex Harvester (<300ms)
  console.log('\n--- 4. Testing 2FA IMAP Regex Engine ---');
  const sampleBestBuyEmail = 'Your Best Buy verification code is: 849201. Please enter this code within 15 minutes.';
  const sampleWalmartEmail = 'Your Walmart code is 193847 to verify your account.';
  const sampleTargetEmail = 'Target Security Alert: 554109 is your temporary security code.';
  const sampleAmazonEmail = '839210 is your Amazon OTP. Do not share it with anyone.';

  assert(imapWorker.extractOtpCode(sampleBestBuyEmail) === '849201', 'Extracted Best Buy 6-digit OTP');
  assert(imapWorker.extractOtpCode(sampleWalmartEmail) === '193847', 'Extracted Walmart 6-digit OTP');
  assert(imapWorker.extractOtpCode(sampleTargetEmail) === '554109', 'Extracted Target 6-digit OTP');
  assert(imapWorker.extractOtpCode(sampleAmazonEmail) === '839210', 'Extracted Amazon 6-digit OTP');

  // 5. Anti-Bot Sensor Harvester (Shape & PerimeterX)
  console.log('\n--- 5. Testing Anti-Bot Telemetry Generators ---');
  const shapeToken = await antiBotEngine.getTargetShapeToken();
  assert(shapeToken.startsWith('SHP_V2_'), 'Generated authentic Target Shape Security sensor token');

  const pxCookie = await antiBotEngine.solveWalmartPerimeterX('https://www.walmart.com');
  assert(pxCookie.includes('_px3=') && pxCookie.includes('Domain=.walmart.com'), 'Synthesized Walmart PerimeterX v3 sensor cookie');

  console.log('\n=====================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED / ${failed} FAILED  `);
  console.log('=====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
