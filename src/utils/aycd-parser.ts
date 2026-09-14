import { BillingProfile, Address } from '../types';

export interface AYCDRawProfile {
  profileName?: string;
  name?: string;
  ProfileName?: string;
  email?: string;
  phone?: string;
  sameBilling?: boolean;
  sameAsShipping?: boolean;
  shipping?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
  shippingAddress?: any;
  billing?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
  billingAddress?: any;
  payment?: {
    cardholderName?: string;
    cardNumber?: string;
    cardType?: string;
    expMonth?: string | number;
    expYear?: string | number;
    cvv?: string;
  };
  card?: any;
  [key: string]: any;
}

export interface ParsedAYCDItem {
  profileName: string;
  email: string;
  phone: string;
  shipping: Address;
  billing: Address;
  sameAsShipping: boolean;
  cardholderName: string;
  cardNumber: string;
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover';
  expMonth: string;
  expYear: string;
  cvv: string;
}

function detectCardBrand(pan: string): 'visa' | 'mastercard' | 'amex' | 'discover' {
  const clean = pan.replace(/\D/g, '');
  if (clean.startsWith('4')) return 'visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  return 'discover';
}

function normalizeAddress(src: any, fallbackName: string, fallbackPhone: string): { address: Address; phone: string } {
  if (!src) {
    return {
      address: {
        fullName: fallbackName || 'Valued Customer',
        addressLine1: '123 Main St',
        addressLine2: '',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
      phone: fallbackPhone || '5551234567',
    };
  }

  const firstName = src.firstName || src.first_name || '';
  const lastName = src.lastName || src.last_name || '';
  const fullName =
    src.fullName || src.full_name || (firstName || lastName ? `${firstName} ${lastName}`.trim() : fallbackName);

  const addressLine1 = src.address1 || src.addressLine1 || src.address_1 || src.street || '';
  const addressLine2 = src.address2 || src.addressLine2 || src.address_2 || src.apt || '';
  const city = src.city || '';
  const state = src.state || src.province || '';
  const zipCode = src.zip || src.zipCode || src.zip_code || src.postalCode || src.postal_code || '';
  const country = src.country || src.countryCode || 'US';
  const phone = src.phone || src.phoneNumber || src.phone_number || fallbackPhone;

  return {
    address: {
      fullName: fullName || 'Valued Customer',
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country: country.length > 2 ? 'US' : country.toUpperCase(),
    },
    phone,
  };
}

/**
 * Parse AYCD Profile Builder JSON file contents
 */
export function parseAYCDJson(content: string): ParsedAYCDItem[] {
  let raw: any;
  try {
    raw = JSON.parse(content);
  } catch (err: any) {
    throw new Error(`Invalid JSON format: ${err.message}`);
  }

  const list: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.profiles)
    ? raw.profiles
    : Array.isArray(raw.data)
    ? raw.data
    : [raw];

  const results: ParsedAYCDItem[] = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item || typeof item !== 'object') continue;

    const profileName =
      item.profileName ||
      item.name ||
      item.ProfileName ||
      item.title ||
      `AYCD Profile #${i + 1}`;

    const email = item.email || item.shipping?.email || item.billing?.email || 'user@example.com';
    const rawPhone = item.phone || item.phoneNumber || item.shipping?.phone || '';

    const shipSrc = item.shipping || item.shippingAddress || item;
    const { address: shipping, phone: extractedPhone } = normalizeAddress(
      shipSrc,
      profileName,
      rawPhone
    );

    const sameAsShipping =
      item.sameBilling !== undefined
        ? !!item.sameBilling
        : item.sameAsShipping !== undefined
        ? !!item.sameAsShipping
        : !item.billing && !item.billingAddress;

    const billSrc = sameAsShipping ? shipSrc : item.billing || item.billingAddress || shipSrc;
    const { address: billing } = normalizeAddress(billSrc, shipping.fullName, extractedPhone);

    const paySrc = item.payment || item.card || item.billingCard || item;
    const cardholderName =
      paySrc.cardholderName ||
      paySrc.nameOnCard ||
      paySrc.cardHolder ||
      paySrc.fullName ||
      shipping.fullName;

    const cardNumber = String(
      paySrc.cardNumber ||
        paySrc.number ||
        paySrc.pan ||
        paySrc.card_number ||
        paySrc.card ||
        ''
    ).replace(/\D/g, '');

    const expMonth = String(paySrc.expMonth || paySrc.expiryMonth || paySrc.month || '12').padStart(
      2,
      '0'
    );
    let expYear = String(paySrc.expYear || paySrc.expiryYear || paySrc.year || '2028');
    if (expYear.length === 4) expYear = expYear.slice(-2);

    const cvv = String(paySrc.cvv || paySrc.securityCode || paySrc.cvc || '123');

    results.push({
      profileName,
      email,
      phone: extractedPhone || rawPhone || '5551234567',
      shipping,
      billing,
      sameAsShipping,
      cardholderName,
      cardNumber: cardNumber || '4111222233334444',
      cardBrand: detectCardBrand(cardNumber || '4111222233334444'),
      expMonth,
      expYear,
      cvv,
    });
  }

  return results;
}

/**
 * Parse AYCD Profile Builder CSV file contents
 */
export function parseAYCDCsv(content: string): ParsedAYCDItem[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row.');
  }

  // Parse header
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  const findIdx = (...keys: string[]) => {
    for (const k of keys) {
      const idx = header.findIndex((h) => h.includes(k));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const pNameIdx = findIdx('profile name', 'profilename', 'name');
  const fNameIdx = findIdx('first name', 'firstname', 'first');
  const lNameIdx = findIdx('last name', 'lastname', 'last');
  const addr1Idx = findIdx('address 1', 'address1', 'street', 'line 1');
  const addr2Idx = findIdx('address 2', 'address2', 'apt', 'suite', 'line 2');
  const cityIdx = findIdx('city');
  const stateIdx = findIdx('state', 'province');
  const zipIdx = findIdx('zip', 'postal');
  const countryIdx = findIdx('country');
  const phoneIdx = findIdx('phone');
  const emailIdx = findIdx('email');
  const cardIdx = findIdx('card number', 'cardnumber', 'pan', 'card');
  const monthIdx = findIdx('exp month', 'expmonth', 'month');
  const yearIdx = findIdx('exp year', 'expyear', 'year');
  const cvvIdx = findIdx('cvv', 'cvc', 'security');

  const results: ParsedAYCDItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const getVal = (idx: number, fallback = '') =>
      idx >= 0 && idx < values.length ? values[idx].replace(/^["']|["']$/g, '').trim() : fallback;

    const firstName = getVal(fNameIdx, '');
    const lastName = getVal(lNameIdx, '');
    const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Valued Customer';
    const profileName = getVal(pNameIdx, `AYCD Profile #${i}`);
    const email = getVal(emailIdx, 'user@example.com');
    const phone = getVal(phoneIdx, '5551234567');

    const addressLine1 = getVal(addr1Idx, '123 Main St');
    const addressLine2 = getVal(addr2Idx, '');
    const city = getVal(cityIdx, 'New York');
    const state = getVal(stateIdx, 'NY');
    const zipCode = getVal(zipIdx, '10001');
    const country = getVal(countryIdx, 'US');

    const address: Address = {
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country: country.length > 2 ? 'US' : country.toUpperCase(),
    };

    const cardNumber = getVal(cardIdx, '4111222233334444').replace(/\D/g, '');
    const expMonth = getVal(monthIdx, '12').padStart(2, '0');
    let expYear = getVal(yearIdx, '28');
    if (expYear.length === 4) expYear = expYear.slice(-2);
    const cvv = getVal(cvvIdx, '123');

    results.push({
      profileName,
      email,
      phone,
      shipping: address,
      billing: address,
      sameAsShipping: true,
      cardholderName: fullName,
      cardNumber: cardNumber || '4111222233334444',
      cardBrand: detectCardBrand(cardNumber || '4111222233334444'),
      expMonth,
      expYear,
      cvv,
    });
  }

  return results;
}

/**
 * Universal detector: Auto-detects if string is AYCD JSON or CSV and parses it.
 */
export function parseAYCDData(content: string): ParsedAYCDItem[] {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseAYCDJson(trimmed);
  }
  return parseAYCDCsv(trimmed);
}

/**
 * Export Blank Bot profiles to standard AYCD Profile Builder JSON format
 */
export function exportToAYCDJson(profiles: BillingProfile[]): string {
  const aycdFormat = profiles.map((p) => {
    const shipNames = (p.shippingAddress.fullName || '').split(' ');
    const billNames = (p.billingAddress.fullName || '').split(' ');

    return {
      profileName: p.profileName,
      email: p.email,
      phone: p.phone,
      sameBilling: p.sameAsShipping,
      shipping: {
        firstName: shipNames[0] || 'John',
        lastName: shipNames.slice(1).join(' ') || 'Doe',
        address1: p.shippingAddress.addressLine1,
        address2: p.shippingAddress.addressLine2 || '',
        city: p.shippingAddress.city,
        state: p.shippingAddress.state,
        zip: p.shippingAddress.zipCode,
        country: p.shippingAddress.country || 'US',
        phone: p.phone,
      },
      billing: {
        firstName: billNames[0] || 'John',
        lastName: billNames.slice(1).join(' ') || 'Doe',
        address1: p.billingAddress.addressLine1,
        address2: p.billingAddress.addressLine2 || '',
        city: p.billingAddress.city,
        state: p.billingAddress.state,
        zip: p.billingAddress.zipCode,
        country: p.billingAddress.country || 'US',
        phone: p.phone,
      },
      payment: {
        cardholderName: p.payment.cardholderName,
        cardNumber: p.payment.maskedPan,
        cardType: p.payment.cardBrand,
        expMonth: p.payment.expMonth,
        expYear: `20${p.payment.expYear}`,
        cvv: '***',
      },
    };
  });

  return JSON.stringify(aycdFormat, null, 2);
}
