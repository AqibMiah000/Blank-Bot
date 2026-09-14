import React, { useState } from 'react';
import { X, Sparkles, Copy, Check } from 'lucide-react';

interface AddressJigModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  onApplyJig?: (jigged: { line1: string; line2: string }) => void;
}

export const AddressJigModal: React.FC<AddressJigModalProps> = ({
  isOpen,
  onClose,
  baseAddress,
  onApplyJig,
}) => {
  const [addressLine1, setAddressLine1] = useState(baseAddress?.addressLine1 || '123 Main Street');
  const [jigCount, setJigCount] = useState<number>(5);
  const [results, setResults] = useState<Array<{ line1: string; line2: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const generateJigs = () => {
    const prefixes = ['Apt', 'Suite', 'Unit', 'Ste', 'Rm', '#', 'Fl', 'Dept'];
    const generated: Array<{ line1: string; line2: string }> = [];

    for (let i = 0; i < jigCount; i++) {
      const p = prefixes[Math.floor(Math.random() * prefixes.length)];
      const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const num = Math.floor(Math.random() * 899) + 100;

      // Jig line 1 with 3 random chars (e.g. "123 Main Street XZR")
      const random3 = Array.from({ length: 3 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      ).join('');

      const line1Variant = Math.random() > 0.5 ? `${addressLine1} ${random3}` : `${addressLine1}`;
      const line2Variant = `${p} ${char}${num}`;

      generated.push({ line1: line1Variant, line2: line2Variant });
    }

    setResults(generated);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-lg bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="p-4 px-6 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              USPS Address Jigging Utility
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-surface-400">
            Generates algorithmic suite/apartment/unit permutations to evade &quot;1 Per Household&quot;
            cancellation algorithms while ensuring valid courier delivery.
          </p>

          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
              Base Address Line 1
            </label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-surface-400">Quantity:</span>
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setJigCount(n)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold ${
                    jigCount === n
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={generateJigs}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20"
            >
              Generate Jigs
            </button>
          </div>

          {/* Results List */}
          {results.length > 0 && (
            <div className="space-y-2 max-h-56 overflow-y-auto pt-2 border-t border-surface-800">
              {results.map((jig, idx) => (
                <div
                  key={idx}
                  className="bg-surface-950 p-2.5 rounded-xl border border-surface-800 flex items-center justify-between text-xs"
                >
                  <div className="font-mono text-slate-200">
                    <div>{jig.line1}</div>
                    <div className="text-surface-400 text-[11px]">{jig.line2}</div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => copyToClipboard(`${jig.line1}, ${jig.line2}`, idx)}
                      className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300"
                      title="Copy"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {onApplyJig && (
                      <button
                        onClick={() => {
                          onApplyJig(jig);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 rounded-lg text-[11px] font-semibold"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
