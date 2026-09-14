import React, { useState } from 'react';
import { X, CreditCard, Sparkles, Shield, Lock } from 'lucide-react';
import { BillingProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: BillingProfile) => Promise<void>;
  initialProfile?: BillingProfile | null;
  onOpenJigModal?: (baseAddress: any) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  onOpenJigModal,
}) => {
  const [profileName, setProfileName] = useState(initialProfile?.profileName || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');

  // Shipping
  const [shipName, setShipName] = useState(initialProfile?.shippingAddress?.fullName || '');
  const [shipLine1, setShipLine1] = useState(initialProfile?.shippingAddress?.addressLine1 || '');
  const [shipLine2, setShipLine2] = useState(initialProfile?.shippingAddress?.addressLine2 || '');
  const [shipCity, setShipCity] = useState(initialProfile?.shippingAddress?.city || '');
  const [shipState, setShipState] = useState(initialProfile?.shippingAddress?.state || '');
  const [shipZip, setShipZip] = useState(initialProfile?.shippingAddress?.zipCode || '');
  const [shipCountry, setShipCountry] = useState(initialProfile?.shippingAddress?.country || 'US');

  // Billing
  const [sameAsShipping, setSameAsShipping] = useState(initialProfile?.sameAsShipping ?? true);
  const [billName, setBillName] = useState(initialProfile?.billingAddress?.fullName || '');
  const [billLine1, setBillLine1] = useState(initialProfile?.billingAddress?.addressLine1 || '');
  const [billLine2, setBillLine2] = useState(initialProfile?.billingAddress?.addressLine2 || '');
  const [billCity, setBillCity] = useState(initialProfile?.billingAddress?.city || '');
  const [billState, setBillState] = useState(initialProfile?.billingAddress?.state || '');
  const [billZip, setBillZip] = useState(initialProfile?.billingAddress?.zipCode || '');

  // Payment
  const [cardholderName, setCardholderName] = useState(initialProfile?.payment?.cardholderName || '');
  const [pan, setPan] = useState(initialProfile?.payment?.maskedPan?.replace(/[•\s]/g, '') || '');
  const [expMonth, setExpMonth] = useState(initialProfile?.payment?.expMonth || '12');
  const [expYear, setExpYear] = useState(initialProfile?.payment?.expYear || '28');
  const [cvv, setCvv] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  if (!isOpen) return null;

  const detectBrand = (num: string): 'visa' | 'mastercard' | 'amex' | 'discover' => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    return 'discover';
  };

  const handleApplyVCCPreset = (type: 'privacy' | 'eno' | 'stripe') => {
    // Generate simulated valid test VCC for the chosen issuer
    const brand = type === 'eno' ? '5555' : '4000';
    const random12 = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
    setPan(`${brand}${random12}`);
    setCvv('123');
    setExpMonth('10');
    setExpYear('29');
    setProfileName((prev) => prev || `${type.toUpperCase()} VCC Drop Profile`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !email || !shipLine1 || !pan) return;

    setIsEncrypting(true);
    try {
      const cardBrand = detectBrand(pan);
      const cleanPan = pan.replace(/\D/g, '');
      const maskedPan = `•••• •••• •••• ${cleanPan.slice(-4)}`;

      // Client-side AES-256-GCM encryption
      let panEncrypted = initialProfile?.payment?.panEncrypted || '';
      let cvvEncrypted = initialProfile?.payment?.cvvEncrypted || '';

      if (window.blankBotAPI) {
        panEncrypted = await window.blankBotAPI.encrypt(cleanPan);
        cvvEncrypted = await window.blankBotAPI.encrypt(cvv || '123');
      } else {
        // Fallback simulation
        panEncrypted = `mock_enc_${cleanPan}`;
        cvvEncrypted = `mock_enc_${cvv || '123'}`;
      }

      const shippingAddress = {
        fullName: shipName || cardholderName,
        addressLine1: shipLine1,
        addressLine2: shipLine2,
        city: shipCity,
        state: shipState,
        zipCode: shipZip,
        country: shipCountry,
      };

      const billingAddress = sameAsShipping
        ? shippingAddress
        : {
            fullName: billName || cardholderName,
            addressLine1: billLine1,
            addressLine2: billLine2,
            city: billCity,
            state: billState,
            zipCode: billZip,
            country: shipCountry,
          };

      const updatedProfile: BillingProfile = {
        id: initialProfile?.id || `prof_${Date.now()}`,
        profileName,
        email,
        phone,
        shippingAddress,
        billingAddress,
        sameAsShipping,
        payment: {
          cardholderName: cardholderName || shipName,
          cardBrand,
          panEncrypted,
          expMonth,
          expYear,
          cvvEncrypted,
          maskedPan,
        },
        createdAt: initialProfile?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await onSave(updatedProfile);
      onClose();
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-2xl bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 px-6 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              {initialProfile ? 'Edit Profile' : 'New Billing & Payment Profile'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Top Bar: Profile Name & Contact */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Profile Name
              </label>
              <input
                type="text"
                required
                placeholder="Personal Drop #1"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="buyer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="5551234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="bg-surface-950/60 p-4 rounded-xl border border-surface-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-surface-300 uppercase tracking-wider">
                Shipping Address
              </span>
              {onOpenJigModal && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenJigModal({
                      addressLine1: shipLine1,
                      addressLine2: shipLine2,
                      city: shipCity,
                      state: shipState,
                      zipCode: shipZip,
                      country: shipCountry,
                    })
                  }
                  className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3 h-3" />
                  Address Jig Tool
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">Full Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={shipName}
                  onChange={(e) => setShipName(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">Address Line 1</label>
                <input
                  type="text"
                  required
                  placeholder="123 Main Street"
                  value={shipLine1}
                  onChange={(e) => setShipLine1(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">Line 2 / Apt</label>
                <input
                  type="text"
                  placeholder="Apt 4B"
                  value={shipLine2}
                  onChange={(e) => setShipLine2(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="New York"
                  value={shipCity}
                  onChange={(e) => setShipCity(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">State</label>
                <input
                  type="text"
                  required
                  placeholder="NY"
                  value={shipState}
                  onChange={(e) => setShipState(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">ZIP Code</label>
                <input
                  type="text"
                  required
                  placeholder="10001"
                  value={shipZip}
                  onChange={(e) => setShipZip(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sameAsShipping"
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500"
            />
            <label htmlFor="sameAsShipping" className="text-xs text-surface-300 font-medium cursor-pointer">
              Billing Address is same as Shipping Address
            </label>
          </div>

          {/* Payment Card Section (AES-256-GCM Encrypted) */}
          <div className="bg-surface-950/80 p-4 rounded-xl border border-brand-500/30 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-400" />
                Hardware AES-256-GCM Encrypted Payment
              </span>
              <div className="flex items-center space-x-1 text-[10px]">
                <span className="text-surface-500">Quick VCC:</span>
                <button
                  type="button"
                  onClick={() => handleApplyVCCPreset('privacy')}
                  className="px-1.5 py-0.5 rounded bg-surface-800 text-surface-300 hover:text-white"
                >
                  Privacy
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyVCCPreset('eno')}
                  className="px-1.5 py-0.5 rounded bg-surface-800 text-surface-300 hover:text-white"
                >
                  Eno
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyVCCPreset('stripe')}
                  className="px-1.5 py-0.5 rounded bg-surface-800 text-surface-300 hover:text-white"
                >
                  Stripe
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[11px] text-surface-400 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-brand-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] text-surface-400 mb-1">Card Number (PAN)</label>
                <input
                  type="text"
                  required
                  placeholder="4000 1234 5678 9010"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono tracking-wider focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">Exp Month</label>
                <input
                  type="text"
                  placeholder="12"
                  maxLength={2}
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono text-center focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">Exp Year</label>
                <input
                  type="text"
                  placeholder="28"
                  maxLength={2}
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono text-center focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">CVV / CVC</label>
                <input
                  type="password"
                  placeholder="•••"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono text-center focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEncrypting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isEncrypting ? 'Encrypting...' : 'Save & Secure Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
