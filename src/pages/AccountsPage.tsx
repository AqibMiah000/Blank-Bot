import React, { useState } from 'react';
import { Plus, UserCheck, Trash2, Shield, Key, X } from 'lucide-react';
import { RetailAccount, Retailer } from '../types';

interface AccountsPageProps {
  accounts: RetailAccount[];
  onSaveAccount: (account: RetailAccount) => Promise<void>;
  onDeleteAccount: (accountId: string) => Promise<void>;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  accounts,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retailer, setRetailer] = useState<Retailer>('bestbuy');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    let passwordEncrypted = password;
    if (window.blankBotAPI) {
      passwordEncrypted = await window.blankBotAPI.encrypt(password);
    }

    const newAccount: RetailAccount = {
      id: `acc_${Date.now()}`,
      retailer,
      email,
      passwordEncrypted,
      status: 'active',
      createdAt: Date.now(),
    };

    await onSaveAccount(newAccount);
    setEmail('');
    setPassword('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-950 overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 px-6 border-b border-surface-800 flex items-center justify-between bg-surface-900/40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Retail Account</span>
        </button>

        <div className="text-xs text-surface-400 font-mono flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>AES-256 Client-Encrypted Credentials</span>
        </div>
      </div>

      {/* Accounts List */}
      <div className="flex-1 p-6 overflow-y-auto">
        {accounts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-surface-500 space-y-2">
            <UserCheck className="w-10 h-10 text-surface-700" />
            <p className="text-xs">No saved retail accounts.</p>
            <p className="text-[11px] text-surface-600">
              Add Best Buy, Walmart, Target, Amazon, or Apple accounts for automated pre-login tokenization.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between hover:border-surface-700 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-800 text-brand-400 border border-surface-700">
                      {account.retailer}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase ${
                        account.status === 'active'
                          ? 'text-emerald-400'
                          : account.status === '2fa_required'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {account.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 font-medium truncate max-w-[200px]">
                    {account.email}
                  </div>
                  <div className="text-[10px] text-surface-500 font-mono flex items-center gap-1">
                    <Key className="w-3 h-3 text-surface-600" />
                    <span>••••••••••••</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteAccount(account.id)}
                  className="p-1.5 rounded-lg bg-surface-800 hover:bg-rose-600/20 text-surface-400 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in p-4">
          <div className="w-full max-w-md bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-5 animate-scale-up shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Add Retail Account
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1.5">
                  Retailer
                </label>
                <select
                  value={retailer}
                  onChange={(e) => setRetailer(e.target.value as Retailer)}
                  className="w-full bg-surface-950 border border-surface-800 focus:border-brand-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
                >
                  <option value="bestbuy">Best Buy US</option>
                  <option value="walmart">Walmart US</option>
                  <option value="target">Target</option>
                  <option value="amazon">Amazon US</option>
                  <option value="apple">Apple US</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1.5">
                  Email / Username
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 focus:border-brand-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all placeholder:text-surface-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 focus:border-brand-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all placeholder:text-surface-600 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surface-800 hover:bg-surface-750 text-surface-300 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-400 text-surface-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/20"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
