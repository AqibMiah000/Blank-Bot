# ⬛ Blank — High-Frequency Desktop Retail Automation Suite

<p align="center">
  <img src=\"build/icon.png\" alt=\"Blank Logo\" width=\"96\" height=\"96\" style=\"border-radius: 16px; border: 1px solid #222;\" />
</p>

<p align="center">
  <b>High-speed, protocol-level retail automation suite designed for drops, restocks, and pricing error glitch sniping.</b>
</p>

<p align="center">
  <img src=\"https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-00f0ff?style=flat-square\" alt=\"Platforms\" />
  <img src=\"https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square\" alt=\"Node.js\" />
  <img src=\"https://img.shields.io/badge/React-19.3-blue?style=flat-square\" alt=\"React\" />
  <img src=\"https://img.shields.io/badge/Electron-35-purple?style=flat-square\" alt=\"Electron\" />
  <img src=\"https://img.shields.io/badge/Security-AES--256--GCM-gold?style=flat-square\" alt=\"Security\" />
  <img src=\"https://img.shields.io/badge/License-MIT-white?style=flat-square\" alt=\"License\" />
</p>

---

## 📖 Comprehensive Documentation
Looking for the full user guide, retailer strategies, proxy configuration, and IMAP 2FA harvesting walkthrough?
👉 **Read the complete [Walkthrough & Help Guide (WALKTHROUGH.md)](WALKTHROUGH.md)** (modeled directly after industry standards).

---

## ⚡ Highlights

- **Ultra-Fast Protocol Automation**: Direct HTTP/2 and TLS client-hello fingerprinting via got-scraping (JA3/JA4 emulation).
- **Retailer Coverage**: Tailored checkout pipelines for **Amazon US**, **Best Buy**, **Walmart**, **Target**, and **Apple**.
- **Real-Time Freebies & Deals Sniper**: Live scanning for pricing glitches, zero-dollar misprices, and verified deals with instant 1-click buy or direct OS browser redirect.
- **Automated IMAP 2FA Harvesting**: Background worker connects to your email inbox via SSL to extract OTP verification codes in <200ms.
- **AES-256-GCM Local Vault**: Bank-grade local encryption ensures financial credentials (PANs, CVVs) never leave your machine unencrypted.
- **9 High-Contrast Stealth Themes**: Fully customizable UI with Refract OLED (pitch black), Stealth Midnight, Cyberpunk Neon, Tokyo Night, and more.
- **Dual-Tier Proxy Management**: Built-in speed and latency benchmark tester for ISP and rotating residential proxy pools.

---

## 🏗️ Architecture

`
┌─────────────────────────────────────────────────────────────┐
│                 React 19 + Vite Renderer (UI)               │
│   • Refract-style Minimalist UI   • High-density Tables     │
│   • 9 Stealth Themes             • Live Freebies Sniper     │
│   • In-App Proxy Benchmarking    • Account / 2FA Manager    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Typed IPC Bridge (preload.cjs)
┌──────────────────────────────▼──────────────────────────────┐
│                Electron Main Process (Node.js)              │
│   • got-scraping TLS JA3/JA4 • IMAP 2FA Harvester (<200ms)  │
│   • Dual-Tier Proxy Router   • Local AES-256-GCM Cipher     │
│   • Anti-Bot Sensor Bypasses • Discord Webhook Embeds       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Optional Cloud Sync
┌──────────────────────────────▼──────────────────────────────┐
│                    Firebase Cloud Backend                   │
│   • Firebase Authentication  • Cloud Firestore Sync         │
│   • Zero Plaintext Exposure  • Strict Security Rules        │
└─────────────────────────────────────────────────────────────┘
`

---

## 🚀 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

### Installation & Development
`ash
# Clone the repository
git clone https://github.com/AqibMiah000/Blank-Bot.git
cd blank

# Install dependencies
npm install

# Run Vite renderer and Electron concurrently
npm run dev:electron
`

### Production Build
`ash
# Compile and build the standalone Windows executable
npm run build:electron
`
The packaged standalone application will be generated in 
elease/win-unpacked/Blank.exe featuring the minimalist blank logo.

---

## 📁 Repository Structure

`	ext
├── build/                # Application blank icon assets (icon.ico, icon.png)
├── electron/             # Electron main process & automation modules
│   ├── crypto/           # AES-256-GCM local vault encryption
│   ├── engine/           # Event-driven task scheduler & concurrency manager
│   ├── modules/          # Retailer checkout logic (Amazon, Best Buy, etc.)
│   ├── services/         # IMAP 2FA worker, proxy tester, Discord webhooks
│   ├── main.ts           # Electron entry point & window manager
│   └── preload.ts        # Typed secure IPC bridge
├── firebase/             # Cloud backup schema & Firestore security rules
├── scripts/              # Build pipelines, icon generation, core verification
├── src/                  # React 19 Frontend
│   ├── components/       # Reusable UI widgets, navigation sidebar, modals
│   ├── context/          # State management (Tasks, Proxies, Accounts, Settings)
│   ├── pages/            # Application pages (Tasks, Proxies, Accounts, Freebies)
│   ├── types/            # TypeScript interfaces & state definitions
│   └── index.css         # Tailwind styles & 9 customized themes
├── WALKTHROUGH.md        # Comprehensive user & setup manual
└── package.json          # Project dependencies & build configuration
`

---

## 📄 License
Released under the [MIT License](LICENSE).
