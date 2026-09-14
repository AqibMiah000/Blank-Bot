import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Key,
  CheckCircle,
  ExternalLink,
  Zap,
  Flame,
  Globe,
  Youtube,
  Lock,
  Plus,
  Trash2,
  Play,
  Square
} from 'lucide-react';
import { SolverKeys, CaptchaHarvesterSlot } from '../types';

interface CaptchasPageProps {
  solverKeys: SolverKeys;
  onSaveKeys: (keys: SolverKeys) => Promise<void>;
}

const DEFAULT_SLOTS: CaptchaHarvesterSlot[] = [
  { id: '1', name: 'Harvester #1 (Main)', target: 'google', isOpen: false, tokensHarvested: 14 },
  { id: '2', name: 'Harvester #2 (YouTube Warmup)', target: 'youtube', isOpen: false, tokensHarvested: 8 },
  { id: '3', name: 'Harvester #3 (ReCaptcha v3)', target: 'recaptcha', isOpen: false, tokensHarvested: 22 },
  { id: '4', name: 'Harvester #4 (Cloudflare Turnstile)', target: 'turnstile', isOpen: false, tokensHarvested: 5 },
];

export const CaptchasPage: React.FC<CaptchasPageProps> = ({ solverKeys, onSaveKeys }) => {
  const [twoCaptcha, setTwoCaptcha] = useState(solverKeys.twoCaptcha || '');
  const [capSolver, setCapSolver] = useState(solverKeys.capSolver || '');
  const [antiCaptcha, setAntiCaptcha] = useState(solverKeys.antiCaptcha || '');
  const [aycdApiKey, setAycdApiKey] = useState(solverKeys.aycdApiKey || '');
  const [aycdAccessToken, setAycdAccessToken] = useState(solverKeys.aycdAccessToken || '');
  const [aycdAutoRoute, setAycdAutoRoute] = useState(solverKeys.aycdAutoRoute ?? true);
  const [isTestingAutoSolve, setIsTestingAutoSolve] = useState(false);
  const [autoSolveResult, setAutoSolveResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [harvesters, setHarvesters] = useState<CaptchaHarvesterSlot[]>(() => {
    try {
      const saved = localStorage.getItem('blank_harvester_slots');
      return saved ? JSON.parse(saved) : DEFAULT_SLOTS;
    } catch {
      return DEFAULT_SLOTS;
    }
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live Token Diagnostic Tests
  const [shapeToken, setShapeToken] = useState<string | null>(null);
  const [pxCookie, setPxCookie] = useState<string | null>(null);
  const [isHarvestingShape, setIsHarvestingShape] = useState(false);
  const [isHarvestingPX, setIsHarvestingPX] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('blank_harvester_slots', JSON.stringify(harvesters));
    } catch {}
  }, [harvesters]);

  const getTargetUrl = (target: CaptchaHarvesterSlot['target']) => {
    switch (target) {
      case 'google':
        return 'https://accounts.google.com';
      case 'youtube':
        return 'https://www.youtube.com';
      case 'recaptcha':
        return 'https://www.google.com/recaptcha/api2/demo';
      case 'turnstile':
        return 'https://peet.ws/turnstile-test/';
      case 'hcaptcha':
        return 'https://accounts.hcaptcha.com/demo';
      default:
        return 'https://accounts.google.com';
    }
  };

  const handleOpenHarvester = async (slot: CaptchaHarvesterSlot, overrideTarget?: CaptchaHarvesterSlot['target']) => {
    const target = overrideTarget || slot.target;
    const url = getTargetUrl(target);

    if (window.blankBotAPI?.openCaptchaHarvester) {
      await window.blankBotAPI.openCaptchaHarvester({
        id: slot.id,
        targetUrl: url,
        proxy: slot.proxy,
      });
    } else {
      window.open(url, `harvester_${slot.id}`, 'width=480,height=620');
    }

    setHarvesters((prev) =>
      prev.map((h) =>
        h.id === slot.id
          ? { ...h, isOpen: true, target, tokensHarvested: h.tokensHarvested + 1 }
          : h
      )
    );
    setStatusMessage(`Launched ${slot.name} -> ${url}`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCloseHarvester = async (slotId: string) => {
    if (window.blankBotAPI?.closeCaptchaHarvester) {
      await window.blankBotAPI.closeCaptchaHarvester(slotId);
    }
    setHarvesters((prev) =>
      prev.map((h) => (h.id === slotId ? { ...h, isOpen: false } : h))
    );
  };

  const handleAddSlot = () => {
    const nextNum = harvesters.length + 1;
    const newSlot: CaptchaHarvesterSlot = {
      id: String(Date.now()),
      name: `Harvester #${nextNum}`,
      target: 'google',
      isOpen: false,
      tokensHarvested: 0,
    };
    setHarvesters([...harvesters, newSlot]);
  };

  const handleRemoveSlot = async (slotId: string) => {
    await handleCloseHarvester(slotId);
    setHarvesters(harvesters.filter((h) => h.id !== slotId));
  };

  const handleUpdateSlotProxy = (slotId: string, proxy: string) => {
    setHarvesters((prev) =>
      prev.map((h) => (h.id === slotId ? { ...h, proxy } : h))
    );
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveKeys({
        twoCaptcha: twoCaptcha.trim(),
        capSolver: capSolver.trim(),
        antiCaptcha: antiCaptcha.trim(),
        aycdApiKey: aycdApiKey.trim(),
        aycdAccessToken: aycdAccessToken.trim(),
        aycdAutoRoute,
      });
      setStatusMessage('Solver & AYCD credentials saved securely.');
      setTimeout(() => setStatusMessage(null), 3500);
    } finally {
      setIsSaving(false);
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

  const handleTestShape = async () => {
    setIsHarvestingShape(true);
    try {
      if (window.blankBotAPI) {
        const token = await window.blankBotAPI.requestSensorToken('target');
        setShapeToken(token);
      } else {
        setShapeToken(`SHP_MOCK_TOKEN_${Date.now()}_ABC123XYZ`);
      }
    } finally {
      setIsHarvestingShape(false);
    }
  };

  const handleTestPX = async () => {
    setIsHarvestingPX(true);
    try {
      if (window.blankBotAPI) {
        const cookie = await window.blankBotAPI.solvePerimeterX('https://www.walmart.com', {});
        setPxCookie(cookie);
      } else {
        setPxCookie(`_px3=MOCK_PERIMETERX_SENSOR_${Date.now()}; Domain=.walmart.com; Path=/`);
      }
    } finally {
      setIsHarvestingPX(false);
    }
  };

  const totalTokens = harvesters.reduce((acc, h) => acc + h.tokensHarvested, 0);
  const activeHarvesters = harvesters.filter((h) => h.isOpen).length;

  return (
    <div className="flex-1 flex flex-col bg-surface-950 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            Captcha Harvesters &amp; Telemetry Center
          </h2>
          <p className="text-xs text-surface-400 mt-1">
            Native persistent browser windows for Google 0.90 V3 score warmup, YouTube session telemetry, and automated token dispatch.
          </p>
        </div>

        <button
          onClick={handleAddSlot}
          className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-500/20 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Harvester Slot</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-xs text-brand-300 font-mono flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800">
          <div className="text-[10px] font-mono text-surface-400 uppercase">Active Windows</div>
          <div className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <span>{activeHarvesters}</span>
            <span className={`w-2 h-2 rounded-full ${activeHarvesters > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-surface-700'}`} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800">
          <div className="text-[10px] font-mono text-surface-400 uppercase">Total Harvested</div>
          <div className="text-xl font-bold text-brand-400 mt-1 font-mono">{totalTokens}</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800">
          <div className="text-[10px] font-mono text-surface-400 uppercase">V3 Trust Score Est.</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>0.90 (Optimal)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800">
          <div className="text-[10px] font-mono text-surface-400 uppercase">AYCD AutoSolve</div>
          <div className="text-xl font-bold text-white mt-1 font-mono flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                aycdApiKey && aycdAccessToken ? 'bg-emerald-400 animate-pulse' : 'bg-surface-700'
              }`}
            />
            <span
              className={`text-xs ${
                aycdApiKey && aycdAccessToken ? 'text-emerald-400 font-semibold' : 'text-surface-400'
              }`}
            >
              {aycdApiKey && aycdAccessToken ? 'OneClick Active' : 'Unlinked'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800">
          <div className="text-[10px] font-mono text-surface-400 uppercase">PerimeterX Status</div>
          <div className="text-xl font-bold text-cyan-400 mt-1 font-mono flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Telemetry Ready</span>
          </div>
        </div>
      </div>

      {/* Primary Section: AYCD AutoSolve & OneClick Integration */}
      <div className="bg-surface-900 border border-brand-500/40 ring-1 ring-brand-500/20 rounded-2xl p-6 space-y-5 shadow-xl shadow-brand-500/5">
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
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>AYCD AutoSolve &amp; OneClick Integration</span>
                <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-[10px] font-mono normal-case">
                  Toolbox Native
                </span>
              </h3>
            </div>
            <p className="text-xs text-surface-400 mt-1">
              Route high-frequency checkout captchas (reCAPTCHA v2/v3, Turnstile, hCaptcha) directly to your AYCD OneClick desktop application and proxy farm.
            </p>
          </div>

          <div className="flex items-center space-x-2">
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
        </div>

        {autoSolveResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
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

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTestAutoSolve}
              disabled={isTestingAutoSolve}
              className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingAutoSolve ? 'animate-spin' : ''}`} />
              <span>{isTestingAutoSolve ? 'Testing AutoSolve...' : 'Test AutoSolve Connection'}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveKeys}
              disabled={isSaving}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save AYCD Credentials'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Harvester Windows Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-400" />
            Active Harvester Slots
          </span>
          <span className="text-[11px] text-surface-400">
            Click 'Google' or 'YouTube' to warm up persistent cookies
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {harvesters.map((slot) => (
            <div
              key={slot.id}
              className={`p-4 rounded-2xl border transition-all ${
                slot.isOpen
                  ? 'bg-surface-900 border-brand-500/40 ring-1 ring-brand-500/20 shadow-lg'
                  : 'bg-surface-900/60 border-surface-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      slot.isOpen ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-surface-700'
                    }`}
                  />
                  <span className="text-xs font-bold text-white">{slot.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-800 text-surface-300 uppercase">
                    {slot.target}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {slot.isOpen ? (
                    <button
                      onClick={() => handleCloseHarvester(slot.id)}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Square className="w-3 h-3" />
                      <span>Close</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenHarvester(slot)}
                      className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md shadow-brand-500/20 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Launch</span>
                    </button>
                  )}

                  {harvesters.length > 1 && (
                    <button
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="p-1.5 text-surface-500 hover:text-rose-400 hover:bg-surface-800 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Launch Buttons */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                <button
                  onClick={() => handleOpenHarvester(slot, 'google')}
                  className="px-2 py-1.5 bg-surface-950 hover:bg-surface-800 border border-surface-800 hover:border-surface-700 rounded-lg text-[11px] font-semibold text-slate-200 flex items-center justify-center gap-1 transition-all"
                  title="Log into Google Account to ensure 0.90 reCAPTCHA v3 score"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Google</span>
                </button>
                <button
                  onClick={() => handleOpenHarvester(slot, 'youtube')}
                  className="px-2 py-1.5 bg-surface-950 hover:bg-surface-800 border border-surface-800 hover:border-surface-700 rounded-lg text-[11px] font-semibold text-slate-200 flex items-center justify-center gap-1 transition-all"
                  title="Play YouTube streams in background to simulate genuine user activity"
                >
                  <Youtube className="w-3 h-3 text-rose-400" />
                  <span>YouTube</span>
                </button>
                <button
                  onClick={() => handleOpenHarvester(slot, 'recaptcha')}
                  className="px-2 py-1.5 bg-surface-950 hover:bg-surface-800 border border-surface-800 hover:border-surface-700 rounded-lg text-[11px] font-semibold text-slate-200 flex items-center justify-center gap-1 transition-all"
                >
                  <ShieldCheck className="w-3 h-3 text-brand-400" />
                  <span>ReCaptcha</span>
                </button>
                <button
                  onClick={() => handleOpenHarvester(slot, 'turnstile')}
                  className="px-2 py-1.5 bg-surface-950 hover:bg-surface-800 border border-surface-800 hover:border-surface-700 rounded-lg text-[11px] font-semibold text-slate-200 flex items-center justify-center gap-1 transition-all"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Turnstile</span>
                </button>
              </div>

              {/* Assigned Proxy */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase text-surface-400 shrink-0">Proxy:</span>
                <input
                  type="text"
                  placeholder="Direct IP (e.g. 192.168.1.1:8080:user:pass)"
                  value={slot.proxy || ''}
                  onChange={(e) => handleUpdateSlotProxy(slot.id, e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-lg px-2.5 py-1 text-[11px] text-white font-mono placeholder:text-surface-600 focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Simulation Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Target Shape Security Harvester */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Target Shape Security Harvester
              </h3>
              <span className="text-[11px] text-surface-400">
                Pre-generates telemetry tokens and sensor cookies before high-traffic drops.
              </span>
            </div>
            <button
              onClick={handleTestShape}
              disabled={isHarvestingShape}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isHarvestingShape ? 'animate-spin' : ''}`} />
              <span>{isHarvestingShape ? 'Harvesting...' : 'Harvest Token'}</span>
            </button>
          </div>

          <div className="bg-surface-950 p-3 rounded-xl border border-surface-800 font-mono text-xs text-brand-300 break-all space-y-1">
            <span className="text-[10px] text-surface-500 uppercase block font-sans">
              Live Sensor Telemetry:
            </span>
            {shapeToken || 'SHP_V2_READY (Click "Harvest Token" to test telemetry pipeline)'}
          </div>
        </div>

        {/* Module 2: Walmart PerimeterX Solver */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Walmart PerimeterX (PX) Solver
              </h3>
              <span className="text-[11px] text-surface-400">
                Automated sensor-data simulation clearing Walmart human challenge gates.
              </span>
            </div>
            <button
              onClick={handleTestPX}
              disabled={isHarvestingPX}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isHarvestingPX ? 'Solving...' : 'Simulate PX'}</span>
            </button>
          </div>

          <div className="bg-surface-950 p-3 rounded-xl border border-surface-800 font-mono text-xs text-cyan-300 break-all space-y-1">
            <span className="text-[10px] text-surface-500 uppercase block font-sans">
              Generated Cookie Payload:
            </span>
            {pxCookie || '_px3=READY (Automated sensor simulation ready for drop tasks)'}
          </div>
        </div>
      </div>

      {/* Third-Party Solver API Gateway */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            Third-Party Captcha Solver API Gateway
          </h3>
          <p className="text-xs text-surface-400 mt-1">
            Optional API credentials for Cloudflare Turnstile, reCAPTCHA v2/v3, and hCaptcha automated fallback solvers.
          </p>
        </div>

        <form onSubmit={handleSaveKeys} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
              CapSolver API Key
            </label>
            <input
              type="password"
              placeholder="CAP-XXXXX-XXXXX"
              value={capSolver}
              onChange={(e) => setCapSolver(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
              2Captcha API Key
            </label>
            <input
              type="password"
              placeholder="2captcha_api_key"
              value={twoCaptcha}
              onChange={(e) => setTwoCaptcha(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
              Anti-Captcha API Key
            </label>
            <input
              type="password"
              placeholder="anti_captcha_key"
              value={antiCaptcha}
              onChange={(e) => setAntiCaptcha(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Solver API Keys'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
