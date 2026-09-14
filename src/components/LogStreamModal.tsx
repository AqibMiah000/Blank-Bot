import React from 'react';
import { X, Terminal, Copy, Check } from 'lucide-react';
import { TaskLogEntry } from '../types';

interface LogStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  logs: TaskLogEntry[];
}

export const LogStreamModal: React.FC<LogStreamModalProps> = ({
  isOpen,
  onClose,
  taskId,
  logs,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = logs
      .map((l) => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.level.toUpperCase()}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-3xl bg-surface-950 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[70vh]">
        {/* Header */}
        <div className="p-3.5 px-5 bg-surface-900 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-brand-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Live Log Console: {taskId}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
              title="Copy All Logs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 select-text">
          {logs.length === 0 ? (
            <div className="text-surface-600 text-center py-12">No logs recorded for this worker.</div>
          ) : (
            logs.map((log, i) => {
              const levelColor =
                log.level === 'success'
                  ? 'text-emerald-400'
                  : log.level === 'error'
                  ? 'text-rose-400'
                  : log.level === 'warn'
                  ? 'text-amber-400'
                  : 'text-surface-400';

              return (
                <div key={i} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-surface-600 shrink-0 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`font-bold shrink-0 text-[11px] uppercase ${levelColor}`}>
                    [{log.level}]
                  </span>
                  <span className="text-slate-200 break-all">{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
