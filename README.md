# ⬛ Blank — Next-Gen Desktop Retail Automation Suite

<p align="center">
  <img src="build/icon.png" alt="Blank Logo" width="100" height="100" style="border-radius: 20px; border: 1px solid #333;" />
</p>

<p align="center">
  <b>High-speed, protocol-level retail automation suite designed for limited drops, restocks, and pricing error glitch sniping.</b>
</p>

<p align="center">
  <a href="https://github.com/AqibMiah000/Blank-Bot"><img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-00f0ff?style=for-the-badge&logo=windows&logoColor=white" alt="Platform" /></a>
  <a href="https://github.com/AqibMiah000/Blank-Bot"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="https://github.com/AqibMiah000/Blank-Bot"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://github.com/AqibMiah000/Blank-Bot"><img src="https://img.shields.io/badge/Electron-35-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" /></a>
  <a href="https://github.com/AqibMiah000/Blank-Bot"><img src="https://img.shields.io/badge/Security-AES--256--GCM-F59E0B?style=for-the-badge&logo=shield&logoColor=white" alt="Security" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-white?style=for-the-badge" alt="License" /></a>
</p>

---

> 🚀 **New to retail automation?** Read the comprehensive, step-by-step **[Beginner's Walkthrough & Setup Guide (WALKTHROUGH.md)](WALKTHROUGH.md)** to configure your first drop in under 3 minutes.

---

## ⚡ Key Capabilities

| Feature | Description | Status |
| :--- | :--- | :---: |
| **Direct Protocol Checkout** | Sub-second checkout via HTTP/2 and raw TLS client-hello emulation (`got-scraping`). | ✅ Active |
| **Multi-Retailer Engine** | Native checkout workflows for **Amazon US, Best Buy, Walmart, Target, and Apple**. | ✅ Active |
| **AYCD Toolbox Integration** | 1:1 integration with AYCD AutoSolve (OneClick) & Profile Builder (JSON/CSV bidirectional sync). | ✅ Active |
| **Mass SKU Multiplier** | Paste 50+ SKUs at once with automatic round-robin profile allocation. | ✅ Active |
| **Native Captcha Harvesters** | Floating persistent browser windows for Google 0.90 trust score and YouTube warming. | ✅ Active |
| **Automated IMAP 2FA** | Background SSL worker retrieves 6-digit email OTPs in `<200ms` hands-free. | ✅ Active |
| **Live Freebies & Deals** | Automated glitch and deep-discount monitoring with instant 1-click buy or OS browser launch. | ✅ Active |
| **6 Synthesized Sound Packs** | Real-time Web Audio synthesis featuring Refract Cyan, Cyber Laser, Retro 8-bit, and more. | ✅ Active |
| **Discord Remote Control** | Mobile remote commands (`/start [group]`, `/stop all`, `/status`) and rich embed webhooks. | ✅ Active |
| **AES-256-GCM Local Vault** | Card numbers (PANs) and credentials are encrypted on your device before disk write. | ✅ Active |
| **9 Stealth Themes** | Refract OLED (`#000000` pitch black), Stealth Midnight, Cyberpunk, Tokyo Night, etc. | ✅ Active |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph UI ["React 19 + Vite Renderer"]
        A[Tasks & Groups] --> B[Mass Multiplier Modal]
        C[Captcha Harvesters] --> D[AYCD AutoSolve Bridge]
        E[AYCD Profile Sync] --> F[Live Freebies Feed]
    end

    subgraph Core ["Electron Main Process (Node.js)"]
        G[Task Engine] --> H[TLS Fingerprint Client]
        I[IMAP 2FA Worker] --> J[Crypto Vault AES-256]
        K[Proxy Tester] --> L[AYCD OneClick Gateway]
        M[Harvester Windows] --> N[Audio Synthesizer]
    end

    subgraph Targets ["Retailer Endpoints"]
        O[Amazon US]
        P[Best Buy US]
        Q[Walmart US]
        R[Target]
        S[Apple US]
    end

    UI <==> |Typed IPC Bridge| Core
    Core <==> |ISP / Resi Proxies| Targets
```

---

## 🚀 Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher
- Windows 10/11 or macOS 12+

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/AqibMiah000/Blank-Bot.git

# Enter project directory
cd Blank-Bot

# Install dependencies
npm install
```

### 2. Run in Development Mode
```bash
# Launches Vite renderer and Electron concurrently
npm run dev:electron
```

### 3. Build Production Standalone Package
```bash
# Compiles TypeScript, bundles assets, and packages Blank.exe
npm run build:electron
```
The packaged standalone application will be generated in `release/win-unpacked/Blank.exe` with the minimalist blank icon.

---

## 📂 Project Structure

```text
Blank-Bot/
├── build/                 # Minimalist application icon assets (icon.ico, icon.png)
├── electron/              # Electron main process & automation modules
│   ├── crypto/            # AES-256-GCM local vault encryption
│   ├── engine/            # Event-driven task scheduler & concurrency manager
│   ├── modules/           # Retailer checkout logic (Amazon, Best Buy, etc.)
│   ├── services/          # IMAP 2FA worker, proxy tester, Discord webhooks
│   ├── main.ts            # Electron entry point & window manager
│   └── preload.ts         # Typed secure IPC bridge
├── firebase/              # Cloud backup schema & Firestore security rules
├── scripts/               # Build pipelines, icon generation, core verification
├── src/                   # React 19 Frontend
│   ├── components/        # Reusable UI widgets, MassTaskModal, Harvesters
│   ├── context/           # Global application state management
│   ├── pages/             # Tasks, Proxies, Accounts, Freebies, Captchas, Settings
│   ├── types/             # TypeScript interfaces & state definitions
│   └── utils/             # Web Audio real-time synthesizers
├── WALKTHROUGH.md         # Comprehensive beginner-to-pro guide
└── package.json           # Dependencies & build scripts
```

---

## 🛡️ Security & Privacy

Blank was engineered with a zero-knowledge local security architecture:
1. **Zero Cloud Credential Exposure**: Your credit card details, CVVs, and account passwords never touch any cloud server in plaintext.
2. **Local Cryptographic Enclave**: Data saved to disk is encrypted using hardware-accelerated **AES-256-GCM** with a PBKDF2-derived master passphrase.
3. **Session Isolation**: Each captcha harvester and task worker operates with its own isolated partition to prevent cookie contamination.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
