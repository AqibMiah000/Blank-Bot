import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Shield,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
import { BillingProfile } from '../types';
import { parseAYCDData, exportToAYCDJson, ParsedAYCDItem } from '../utils/aycd-parser';

interface AYCDImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProfiles: (profiles: BillingProfile[]) => Promise<void>;
  existingProfiles: BillingProfile[];
}

export const AYCDImportModal: React.FC<AYCDImportModalProps> = ({
  isOpen,
  onClose,
  onImportProfiles,
  existingProfiles,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedAYCDItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      tryParse(content);
    };
    reader.readAsText(file);
  };

  const tryParse = (text: string) => {
    setParseError(null);
    setImportSuccessCount(null);
    if (!text.trim()) {
      setParsedItems([]);
      return;
    }

    try {
      const items = parseAYCDData(text);
      if (items.length === 0) {
        setParseError('No profiles found in the provided AYCD file/content.');
      } else {
        setParsedItems(items);
      }
    } catch (err: any) {
      setParseError(err?.message || 'Failed to parse AYCD format. Check file structure.');
      setParsedItems([]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    tryParse(val);
  };

  const handleImportAll = async () => {
    if (parsedItems.length === 0) return;
    setIsProcessing(true);

    try {
      const newProfiles: BillingProfile[] = [];

      for (let i = 0; i < parsedItems.length; i++) {
        const item = parsedItems[i];
        const cleanPan = item.cardNumber.replace(/\D/g, '');
        const maskedPan = `•••• •••• •••• ${cleanPan.slice(-4) || '0000'}`;

        let panEncrypted = `mock_enc_${cleanPan}`;
        let cvvEncrypted = `mock_enc_${item.cvv}`;

        if (window.blankBotAPI?.encrypt) {
          panEncrypted = await window.blankBotAPI.encrypt(cleanPan);
          cvvEncrypted = await window.blankBotAPI.encrypt(item.cvv || '123');
        }

        const now = Date.now() + i;
        newProfiles.push({
          id: `profile_aycd_${now}_${Math.random().toString(36).substring(2, 7)}`,
          profileName: item.profileName,
          email: item.email,
          phone: item.phone,
          shippingAddress: item.shipping,
          billingAddress: item.billing,
          sameAsShipping: item.sameAsShipping,
          payment: {
            cardholderName: item.cardholderName,
            cardBrand: item.cardBrand,
            panEncrypted,
            expMonth: item.expMonth,
            expYear: item.expYear,
            cvvEncrypted,
            maskedPan,
          },
          createdAt: now,
          updatedAt: now,
        });
      }

      await onImportProfiles(newProfiles);
      setImportSuccessCount(newProfiles.length);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setParseError(err?.message || 'Failed during hardware encryption and import.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportDownload = () => {
    const jsonStr = exportToAYCDJson(existingProfiles);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aycd_profiles_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyExport = () => {
    const jsonStr = exportToAYCDJson(existingProfiles);
    navigator.clipboard.writeText(jsonStr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-surface-800 flex items-center justify-between bg-surface-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AYCD Profile Builder Synchronization</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300">
                  1:1 Refract Native
                </span>
              </h2>
              <p className="text-xs text-surface-400">
                Bidirectional import &amp; export with AYCD Toolbox (JSON &amp; CSV).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 pt-4 border-b border-surface-800/80 bg-surface-950/30 gap-4">
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-surface-400 hover:text-surface-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Profiles ({parsedItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-surface-400 hover:text-surface-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export to AYCD ({existingProfiles.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {activeTab === 'import' ? (
            <>
              {importSuccessCount !== null && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Successfully encrypted and imported {importSuccessCount} profiles into vault!
                  </span>
                </div>
              )}

              {parseError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-surface-700 hover:border-brand-500/60 rounded-2xl p-6 text-center transition-all bg-surface-950/40">
                <input
                  type="file"
                  id="aycd-file-input"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="aycd-file-input"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <FileText className="w-8 h-8 text-brand-400" />
                  <span className="text-xs font-bold text-white">
                    Click to browse or drop AYCD export (.json / .csv)
                  </span>
                  <span className="text-[11px] text-surface-400">
                    Exports directly compatible with AYCD Profile Builder 2.0+
                  </span>
                </label>
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                  Or Paste AYCD JSON / CSV Raw Content
                </label>
                <textarea
                  rows={4}
                  placeholder={`[{"profileName":"Sample 1","shipping":{"firstName":"John","lastName":"Doe","address1":"123 Main St","city":"New York","state":"NY","zip":"10001","country":"US"},"payment":{"cardNumber":"4111222233334444","expMonth":"12","expYear":"28","cvv":"123"}}]`}
                  value={rawText}
                  onChange={handleTextChange}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl p-3 text-xs text-white font-mono placeholder:text-surface-600 focus:border-brand-500 outline-none resize-none"
                />
              </div>

              {/* Live Profile Table Preview */}
              {parsedItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span className="font-semibold text-white">
                      Detected Profiles ({parsedItems.length}):
                    </span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      Ready for AES-256 Hardware Encryption
                    </span>
                  </div>

                  <div className="border border-surface-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-950 text-surface-400 font-mono uppercase text-[10px] sticky top-0">
                        <tr>
                          <th className="p-2.5">Profile</th>
                          <th className="p-2.5">Recipient</th>
                          <th className="p-2.5">Address</th>
                          <th className="p-2.5">Card</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-800 font-mono text-[11px] text-surface-300">
                        {parsedItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-800/40">
                            <td className="p-2.5 font-bold text-white">{item.profileName}</td>
                            <td className="p-2.5">{item.shipping.fullName}</td>
                            <td className="p-2.5 text-surface-400">
                              {item.shipping.addressLine1}, {item.shipping.city},{' '}
                              {item.shipping.state}
                            </td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded bg-surface-800 text-brand-300 uppercase text-[10px] mr-1.5">
                                {item.cardBrand}
                              </span>
                              •••• {item.cardNumber.slice(-4) || '4242'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-surface-400">
                Export all {existingProfiles.length} profiles from Blank Bot into standard AYCD
                Profile Builder format. You can import this JSON file directly into AYCD Profile
                Builder or other compatible platforms.
              </p>

              <div className="bg-surface-950 p-4 rounded-xl border border-surface-800 max-h-56 overflow-y-auto font-mono text-xs text-surface-300">
                <pre>{exportToAYCDJson(existingProfiles)}</pre>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportDownload}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download AYCD JSON File</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyExport}
                  className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-surface-700"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{isCopied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'import' && (
          <div className="p-4 px-6 border-t border-surface-800 bg-surface-950/60 flex items-center justify-between">
            <div className="text-xs text-surface-400 font-mono flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>AES-256-GCM Hardware Vault</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={parsedItems.length === 0 || isProcessing}
                onClick={handleImportAll}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Encrypting & Importing...'
                    : `Import ${parsedItems.length} Profiles`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
