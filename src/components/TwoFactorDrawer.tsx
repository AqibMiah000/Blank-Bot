import React, { useState } from 'react';
import { X, Key, CheckCircle, Clock } from 'lucide-react';
import { TwoFactorRequest } from '../types';

interface TwoFactorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pendingRequests: TwoFactorRequest[];
  onSubmitCode: (requestId: string, code: string) => Promise<boolean>;
}

export const TwoFactorDrawer: React.FC<TwoFactorDrawerProps> = ({
  isOpen,
  onClose,
  pendingRequests,
  onSubmitCode,
}) => {
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (requestId: string, val: string) => {
    // Digits only, max 6
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setCodeInputs((prev) => ({ ...prev, [requestId]: cleaned }));
  };

  const handleSubmit = async (requestId: string) => {
    const code = codeInputs[requestId];
    if (!code || code.length !== 6) return;

    setSubmittingId(requestId);
    try {
      await onSubmitCode(requestId, code);
      setCodeInputs((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-96 bg-surface-900 border-l border-surface-800 h-full flex flex-col shadow-2xl animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2FA Challenge Drawer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-surface-400 hover:text-white hover:bg-surface-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-surface-500 space-y-2">
              <CheckCircle className="w-8 h-8 text-surface-600" />
              <p className="text-xs">No pending 2FA verification challenges.</p>
              <p className="text-[11px] text-surface-600 text-center max-w-[200px]">
                Automatic IMAP harvester listens continuously in the background.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => {
              const currentVal = codeInputs[req.id] || '';
              return (
                <div
                  key={req.id}
                  className="bg-surface-950 border border-amber-500/40 rounded-xl p-3.5 space-y-3 shadow-md shadow-amber-500/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {req.retailer}
                    </span>
                    <span className="text-[10px] text-surface-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(req.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-slate-200 font-medium truncate">{req.email}</div>
                    <div className="text-[11px] text-surface-400 font-mono">Task ID: {req.taskId}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit OTP"
                      value={currentVal}
                      onChange={(e) => handleInputChange(req.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(req.id)}
                      className="flex-1 bg-surface-900 border border-surface-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-center font-mono text-sm tracking-widest text-amber-300 placeholder:text-surface-600 outline-none"
                    />
                    <button
                      onClick={() => handleSubmit(req.id)}
                      disabled={currentVal.length !== 6 || submittingId === req.id}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-lg transition-all"
                    >
                      {submittingId === req.id ? '...' : 'Inject'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
