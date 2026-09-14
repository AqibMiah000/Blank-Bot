import React, { useState } from 'react';
import {
  Bell,
  Volume2,
  Lock,
  Mail,
  Download,
  Upload,
  Send,
  CheckCircle,
  Save,
  Palette,
  Sliders,
  Gift,
  ExternalLink,
  Zap,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { AppSettings, ThemeId, SoundPackId } from '../types';
import {
  playHighPitchedChime,
  playFreebieSniperChime,
  playRefractCyanChime,
  playLaserPing,
  playRetroArcade,
  playSubThud,
  playMechanicalClick,
  playCheckoutSound,
} from '../utils/audio';

interface SettingsPageProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => Promise<void>;
  onThemeChange?: (theme: ThemeId) => void;
  onExportBackup: () => Promise<void>;
  onImportBackup: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
  onThemeChange,
  onExportBackup,
  onImportBackup,
}) => {
  const [theme, setTheme] = useState<ThemeId>(settings.theme || 'oled');
  const [soundPack, setSoundPack] = useState<SoundPackId>(settings.soundPack || 'refract_cyan');
  const [enableFreebiesSniper, setEnableFreebiesSniper] = useState(
    settings.enableFreebiesSniper ?? true
  );
  const [enableMarketAnalytics, setEnableMarketAnalytics] = useState(
    settings.enableMarketAnalytics ?? true
  );
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(settings.discordWebhookUrl || '');
  const [discordNotifyOnSuccess, setDiscordNotifyOnSuccess] = useState(
    settings.discordNotifyOnSuccess ?? true
  );
  const [enableRemoteControl, setEnableRemoteControl] = useState(
    settings.enableRemoteControl ?? false
  );
  const [playSoundOnSuccess, setPlaySoundOnSuccess] = useState(settings.playSoundOnSuccess ?? true);
  const [customSoundPath, setCustomSoundPath] = useState(settings.customSoundPath || '');
  const [encryptionPassphrase, setEncryptionPassphrase] = useState(
    settings.encryptionPassphrase || ''
  );
  const [defaultMonitorDelay, setDefaultMonitorDelay] = useState(
    settings.defaultMonitorDelay || 3500
  );
  const [defaultRetryDelay, setDefaultRetryDelay] = useState(settings.defaultRetryDelay || 2000);

  // AYCD AutoSolve settings
  const [aycdApiKey, setAycdApiKey] = useState(settings.solverKeys?.aycdApiKey || '');
  const [aycdAccessToken, setAycdAccessToken] = useState(settings.solverKeys?.aycdAccessToken || '');
  const [aycdAutoRoute, setAycdAutoRoute] = useState(settings.solverKeys?.aycdAutoRoute ?? true);
  const [isTestingAutoSolve, setIsTestingAutoSolve] = useState(false);
  const [autoSolveResult, setAutoSolveResult] = useState<{ success: boolean; message: string } | null>(null);

  // IMAP settings
  const [imapEmail, setImapEmail] = useState('');
  const [imapPassword, setImapPassword] = useState('');
  const [imapHost, setImapHost] = useState('imap.gmail.com');
  const [imapPort, setImapPort] = useState(993);
  const [imapStatusMsg, setImapStatusMsg] = useState<string | null>(null);

  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectTheme = (t: ThemeId) => {
    setTheme(t);
    document.documentElement.className = `theme-${t} dark`;
    localStorage.setItem('blank_theme', t);
    if (onThemeChange) {
      onThemeChange(t);
    }
  };

  const handleTestAutoSolve = async () => {
    if (!aycdApiKey.trim() || !aycdAccessToken.trim()) {
      setAutoSolveResult({
        success: false,
        message: 'Please enter both AYCD AutoSolve API Key and Access Token first.',
      });
      return;
    }

    setIsTestingAutoSolve(true);
    setAutoSolveResult(null);
    try {
      if (window.blankBotAPI?.testAutoSolve) {
        const res = await window.blankBotAPI.testAutoSolve(
          aycdApiKey.trim(),
          aycdAccessToken.trim()
        );
        setAutoSolveResult(res);
      } else {
        setAutoSolveResult({
          success: true,
          message: 'Connected to AYCD OneClick successfully! (Simulation Mode)',
        });
      }
    } catch (err: any) {
      setAutoSolveResult({
        success: false,
        message: err?.message || 'Failed to connect to AYCD AutoSolve.',
      });
    } finally {
      setIsTestingAutoSolve(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        ...settings,
        theme,
        soundPack,
        enableFreebiesSniper,
        enableMarketAnalytics,
        discordWebhookUrl: discordWebhookUrl.trim(),
        discordNotifyOnSuccess,
        enableRemoteControl,
        playSoundOnSuccess,
        customSoundPath: customSoundPath.trim(),
        encryptionPassphrase: encryptionPassphrase.trim(),
        defaultMonitorDelay,
        defaultRetryDelay,
        solverKeys: {
          ...settings.solverKeys,
          aycdApiKey: aycdApiKey.trim(),
          aycdAccessToken: aycdAccessToken.trim(),
          aycdAutoRoute,
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!discordWebhookUrl.trim()) return;
    setTestWebhookStatus('Sending test webhook...');

    if (window.blankBotAPI) {
      const ok = await window.blankBotAPI.sendDiscordWebhook(discordWebhookUrl.trim(), {
        title: 'Pokémon TCG: 151 Booster Bundle (Test Notification)',
        sku: '6579999',
        retailer: 'BEST BUY US',
        price: '$28.99',
        profileName: 'Primary Drop Profile',
        maskedCard: '•••• •••• •••• 4242',
        latency: 740,
        orderId: 'BBY-TEST-999',
      });
      setTestWebhookStatus(ok ? '✅ Webhook sent successfully!' : '❌ Webhook dispatch failed');
    } else {
      setTestWebhookStatus('✅ Simulated webhook payload verified');
    }

    setTimeout(() => setTestWebhookStatus(null), 3500);
  };

  const handleTestSound = async () => {
    playHighPitchedChime();
    if (window.blankBotAPI && customSoundPath) {
      await window.blankBotAPI.playAlertSound('success', customSoundPath);
    }
  };

  const handleConnectIMAP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imapEmail || !imapPassword) return;

    setImapStatusMsg('Connecting to IMAP mail server...');
    if (window.blankBotAPI) {
      const ok = await window.blankBotAPI.connectIMAP({
        host: imapHost,
        port: imapPort,
        secure: true,
        auth: { user: imapEmail, pass: imapPassword },
      });
      setImapStatusMsg(ok ? '✅ IMAP listener connected successfully' : '❌ IMAP connection failed');
    } else {
      setImapStatusMsg('✅ Simulated IMAP connection active');
    }
    setTimeout(() => setImapStatusMsg(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-950 overflow-y-auto p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          System Integrations &amp; Global Preferences
        </h2>
        <p className="text-xs text-surface-400 mt-1">
          Configure visual themes, Discord notifications, high-pitched audio chimes, and state migration.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Appearance & 9 Stealth Themes */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-400" />
              UI Theme &amp; Stealth Aesthetics
            </span>
            <span className="text-[11px] font-mono text-brand-400 font-bold uppercase">
              Active: {theme}
            </span>
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            Select your preferred visual style, including Refract's famous true pitch-black OLED mode:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2.5">
            {[
              { id: 'oled', name: 'Refract OLED', tag: 'True Pitch Black', color: '#00f0ff', bg: '#000000' },
              { id: 'midnight', name: 'Stealth Midnight', tag: 'Pure Monochrome', color: '#f8fafc', bg: '#050507' },
              { id: 'obsidian', name: 'Obsidian Dark', tag: 'Cyan Glow', color: '#06b6d4', bg: '#070a10' },
              { id: 'carbon', name: 'Carbon Gold', tag: 'Amber / Gold', color: '#f59e0b', bg: '#080806' },
              { id: 'dracula', name: 'Dracula Neon', tag: 'Gothic Violet', color: '#bd93f9', bg: '#090611' },
              { id: 'nord', name: 'Nordic Frost', tag: 'Arctic Ice Blue', color: '#38bdf8', bg: '#060a0f' },
              { id: 'emerald', name: 'Cyber Emerald', tag: 'Matrix Green', color: '#10b981', bg: '#030805' },
              { id: 'crimson', name: 'Crimson Protocol', tag: 'Rose Red', color: '#f43f5e', bg: '#090305' },
              { id: 'titanium', name: 'Titanium Cobalt', tag: 'Electric Blue', color: '#3b82f6', bg: '#050914' },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => handleSelectTheme(t.id as ThemeId)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  theme === t.id
                    ? 'border-brand-500 bg-surface-850 ring-1 ring-brand-500/50 shadow-md'
                    : 'border-surface-800/80 bg-surface-950/60 hover:border-surface-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                      style={{ backgroundColor: t.color }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: t.bg }}
                    />
                  </div>
                  {theme === t.id && (
                    <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-100 truncate">{t.name}</div>
                <div className="text-[10px] text-surface-400 font-mono truncate">
                  {t.tag}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modules & Navigation Tabs */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            Modules &amp; Navigation Tabs
          </span>
          <p className="text-xs text-surface-400 leading-relaxed">
            Customize which automated tools appear in your navigation bar:
          </p>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-950 border border-surface-800 hover:border-surface-700 cursor-pointer transition-all">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Live Market &amp; TCG Intelligence Feed</span>
                <span className="text-[11px] text-surface-400 block mt-0.5 leading-relaxed">
                  Real-time market analytics, MSRP resale spreads, ROI margins, and 1-click task provisioning across Pokémon TCG, One Piece, Sports Cards, GPUs, and Consoles.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableMarketAnalytics}
              onChange={(e) => setEnableMarketAnalytics(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 accent-brand-500 cursor-pointer shrink-0 ml-3"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-950 border border-surface-800 hover:border-surface-700 cursor-pointer transition-all">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 mt-0.5 shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Amazon US Freebies &amp; Deals Sniper</span>
                <span className="text-[11px] text-surface-400 block mt-0.5 leading-relaxed">
                  Display the 24/7 price drop and clearance restock sniper in the sidebar navigation. Turn off to completely remove this tab from the interface.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableFreebiesSniper}
              onChange={(e) => setEnableFreebiesSniper(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 accent-brand-500 cursor-pointer shrink-0 ml-3"
            />
          </label>
        </div>
        {/* Discord Webhook Integration */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-400" />
              Discord Checkout Webhook
            </span>
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={!discordWebhookUrl}
              className="px-3 py-1 bg-surface-800 hover:bg-surface-700 disabled:opacity-40 text-brand-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Test Webhook</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
              Webhook URL
            </label>
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>

          {testWebhookStatus && (
            <div className="text-xs font-mono text-cyan-300">{testWebhookStatus}</div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notifySuccess"
              checked={discordNotifyOnSuccess}
              onChange={(e) => setDiscordNotifyOnSuccess(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500"
            />
            <label htmlFor="notifySuccess" className="text-xs text-surface-300">
              Send rich embed confirmations on order placement (includes SKU, masked card, and latency)
            </label>
          </div>

          <div className="p-3 bg-surface-950/80 border border-surface-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Discord Remote Control Listener</span>
                <span className="text-[11px] text-surface-400 block">
                  Listen for incoming Discord commands: <code className="text-brand-300">/start [group]</code>, <code className="text-brand-300">/stop all</code>, <code className="text-brand-300">/status</code>
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableRemoteControl}
                onChange={(e) => setEnableRemoteControl(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 accent-brand-500 cursor-pointer ml-3 shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Audio Alerts & Sound Packs */}
        <div className="bg-surface-900/60 border border-surface-800/40 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Audio Alert Engine &amp; Sound Packs
            </span>
            <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold">
              Active: {soundPack}
            </span>
          </div>

          <p className="text-xs text-surface-400">
            Choose your signature checkout alert synthesized directly in real-time with Web Audio:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              { id: 'refract_cyan', name: 'Refract Cyan', desc: 'Crystal C6-D7 arpeggio', play: playRefractCyanChime },
              { id: 'laser_ping', name: 'Cyber Laser', desc: 'High-voltage laser ping', play: playLaserPing },
              { id: 'retro_arcade', name: '8-Bit Arcade', desc: 'Nostalgic level-up chime', play: playRetroArcade },
              { id: 'sub_thud', name: 'Sub-Bass Thud', desc: 'Cinematic deep bass impact', play: playSubThud },
              { id: 'mechanical_click', name: 'Haptic Click', desc: 'Crisp tactile switch', play: playMechanicalClick },
              { id: 'mute', name: 'Mute Audio', desc: 'Complete silent stealth mode', play: () => {} },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setSoundPack(p.id as SoundPackId)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  soundPack === p.id
                    ? 'border-emerald-500 bg-surface-850 ring-1 ring-emerald-500/40 shadow-md'
                    : 'border-surface-800/80 bg-surface-950/60 hover:border-surface-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{p.name}</span>
                    {soundPack === p.id && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-surface-400 font-mono mt-0.5">{p.desc}</div>
                </div>

                {p.id !== 'mute' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSoundPack(p.id as SoundPackId);
                      p.play();
                    }}
                    className="p-1.5 bg-surface-800 hover:bg-surface-700 text-emerald-400 rounded-lg text-xs font-semibold ml-2 shrink-0 transition-all"
                    title="Preview Sound"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Freebie Sniper Glitch Chime */}
            <div className="p-3.5 rounded-xl bg-surface-950/60 border border-surface-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Freebie Glitch Notification</span>
                <span className="text-[11px] text-surface-400 block">Unique high-frequency double blip</span>
              </div>
              <button
                type="button"
                onClick={() => playFreebieSniperChime()}
                className="px-2.5 py-1.5 bg-surface-800 hover:bg-surface-700 text-brand-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ml-2"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Blip</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-950/60 border border-surface-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Active Checkout Sound</span>
                <span className="text-[11px] text-surface-400 block">Preview currently active sound pack</span>
              </div>
              <button
                type="button"
                onClick={() => playCheckoutSound(soundPack)}
                className="px-2.5 py-1.5 bg-surface-800 hover:bg-surface-700 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ml-2"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Play Sound</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="soundSuccess"
              checked={playSoundOnSuccess}
              onChange={(e) => setPlaySoundOnSuccess(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 accent-brand-500 cursor-pointer"
            />
            <label htmlFor="soundSuccess" className="text-xs text-surface-300 cursor-pointer">
              Play selected sound pack alert on retail checkout confirmation
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
              Custom Audio File Path (.wav, .mp3 - optional)
            </label>
            <input
              type="text"
              placeholder="C:\sounds\success_chime.wav"
              value={customSoundPath}
              onChange={(e) => setCustomSoundPath(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        {/* IMAP 2FA Credentials */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              Automated 2FA IMAP Listener (Gmail &amp; Outlook)
            </span>
          </div>
          <p className="text-xs text-surface-400">
            Maintains continuous TLS/SSL connection to harvest 6-digit OTP passcodes in &lt;300ms. Use Google &quot;App Passwords&quot; if using Gmail.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Mail Server Host
              </label>
              <input
                type="text"
                placeholder="imap.gmail.com"
                value={imapHost}
                onChange={(e) => setImapHost(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Port
              </label>
              <input
                type="number"
                value={imapPort}
                onChange={(e) => setImapPort(Number(e.target.value))}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="alerts@gmail.com"
                value={imapEmail}
                onChange={(e) => setImapEmail(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                App Password / Passcode
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={imapPassword}
                onChange={(e) => setImapPassword(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleConnectIMAP}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Connect &amp; Start Listener
            </button>
            {imapStatusMsg && (
              <span className="text-xs font-mono text-cyan-300">{imapStatusMsg}</span>
            )}
          </div>
        </div>

        {/* AYCD AutoSolve & OneClick Integration */}
        <div className="bg-surface-900 border border-brand-500/40 ring-1 ring-brand-500/20 rounded-2xl p-5 space-y-4 shadow-xl shadow-brand-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    aycdApiKey && aycdAccessToken
                      ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>AYCD AutoSolve &amp; OneClick Integration</span>
                  <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-[10px] font-mono normal-case">
                    Toolbox Native
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-surface-400 mt-1">
                Route high-frequency checkout captchas (reCAPTCHA v2/v3, Turnstile, hCaptcha) directly to your AYCD OneClick desktop app.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.blankBotAPI?.openExternal) {
                  window.blankBotAPI.openExternal('https://aycd.io/account');
                } else {
                  window.open('https://aycd.io/account', '_blank');
                }
              }}
              className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-all border border-surface-700"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
              <span>AYCD Dashboard</span>
            </button>
          </div>

          {autoSolveResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                autoSolveResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {autoSolveResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Zap className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{autoSolveResult.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                AutoSolve API Key
              </label>
              <input
                type="password"
                placeholder="Paste AYCD AutoSolve API Key..."
                value={aycdApiKey}
                onChange={(e) => setAycdApiKey(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
              />
              <span className="text-[10px] text-surface-500 mt-1 block font-mono">
                AYCD OneClick &rarr; Settings &rarr; AutoSolve
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                AutoSolve Access Token
              </label>
              <input
                type="password"
                placeholder="Paste AYCD AutoSolve Access Token..."
                value={aycdAccessToken}
                onChange={(e) => setAycdAccessToken(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
              />
              <span className="text-[10px] text-surface-500 mt-1 block font-mono">
                Generated in AYCD OneClick AutoSolve tab
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aycdAutoRoute}
                onChange={(e) => setAycdAutoRoute(e.target.checked)}
                className="w-4 h-4 rounded border-surface-700 bg-surface-950 text-brand-600 focus:ring-brand-500/20"
              />
              <span className="text-xs font-medium text-surface-300">
                Auto-route checkout challenge tokens to AYCD OneClick during drops
              </span>
            </label>

            <button
              type="button"
              onClick={handleTestAutoSolve}
              disabled={isTestingAutoSolve}
              className="px-4 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingAutoSolve ? 'animate-spin' : ''}`} />
              <span>{isTestingAutoSolve ? 'Testing...' : 'Test AutoSolve Connection'}</span>
            </button>
          </div>
        </div>

        {/* Encryption Passphrase & Backup Portability */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            Local AES-256-GCM Cryptography &amp; Portability
          </span>

          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
              Custom Encryption Passphrase (Optional)
            </label>
            <input
              type="password"
              placeholder="Leave blank to use hardware-derived default"
              value={encryptionPassphrase}
              onChange={(e) => setEncryptionPassphrase(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onExportBackup}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Encrypted JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={onImportBackup}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import State Backup</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Global Preferences'}</span>
        </button>
      </form>
    </div>
  );
};
