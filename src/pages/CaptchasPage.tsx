import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Key, CheckCircle, Terminal, Zap } from 'lucide-react';
import { SolverKeys } from '../types';

interface CaptchasPageProps {
  solverKeys: SolverKeys;
  onSaveKeys: (keys: SolverKeys) => Promise<void>;
}

export const CaptchasPage: React.FC<CaptchasPageProps> = ({ solverKeys, onSaveKeys }) => {
  const [twoCaptcha, setTwoCaptcha] = useState(solverKeys.twoCaptcha || '');
  const [capSolver, setCapSolver] = useState(solverKeys.capSolver || '');
  const [antiCaptcha, setAntiCaptcha] = useState(solverKeys.antiCaptcha || '');
  const [isSaving, setIsSaving] = useState(false);

  // Live Token Diagnostic Tests
  const [shapeToken, setShapeToken] = useState<string | null>(null);
  const [pxCookie, setPxCookie] = useState<string | null>(null);
  const [isHarvestingShape, setIsHarvestingShape] = useState(false);
  const [isHarvestingPX, setIsHarvestingPX] = useState(false);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveKeys({
        twoCaptcha: twoCaptcha.trim(),
        capSolver: capSolver.trim(),
        antiCaptcha: antiCaptcha.trim(),
      });
    } finally {
      setIsSaving(false);
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

  return (
    <div className="flex-1 flex flex-col bg-surface-950 overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          Anti-Bot Defense &amp; Telemetry Harvester
        </h2>
        <p className="text-xs text-surface-400 mt-1">
          Automated client-side sensor generators, pre-warmed telemetry cookies, and third-party solver API gateways.
        </p>
      </div>

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

      {/* Module 3: Third-Party Solver API Gateway */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            Third-Party Captcha Solver API Gateway
          </h3>
          <p className="text-xs text-surface-400 mt-1">
            Optional API credentials for Cloudflare Turnstile, reCAPTCHA v2/v3, and hCaptcha fallbacks.
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
