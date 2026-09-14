# ⬛ Blank Documentation & User Walkthrough

> **Welcome to the official Blank documentation.**
> Modeled after industry-leading automation suites, this guide covers everything from core fundamentals and first-time installation to multi-threaded task management, residential proxy routing, automated IMAP 2FA harvesting, native detached captcha harvesters, and freebie glitch sniping.

---

## 📑 Table of Contents

1. [Introduction to Retail Automation](#1-introduction-to-retail-automation)
2. [Quickstart & Installation](#2-quickstart--installation)
3. [Core System Architecture](#3-core-system-architecture)
4. [Tasks, Mass Quick-Import & Multipliers](#4-tasks-mass-quick-import--multipliers)
5. [Retailer Modules & Strategies](#5-retailer-modules--strategies)
   - [Amazon US](#amazon-us)
   - [Best Buy](#best-buy)
   - [Walmart](#walmart)
   - [Target](#target)
   - [Apple](#apple)
6. [Billing Profiles, VCCs & Address Jigging](#6-billing-profiles-vccs--address-jigging)
7. [Proxy Pools & Network Management](#7-proxy-pools--network-management)
8. [Accounts & Automated IMAP 2FA Harvesting](#8-accounts--automated-imap-2fa-harvesting)
9. [Freebies & Deals Glitch Sniper](#9-freebies--deals-glitch-sniper)
10. [Native Captcha Harvesters & Sensor Telemetry](#10-native-captcha-harvesters--sensor-telemetry)
11. [Settings, Sound Packs & Discord Remote Control](#11-settings-sound-packs--discord-remote-control)
12. [Troubleshooting & Error Directory](#12-troubleshooting--error-directory)

---

## 1. Introduction to Retail Automation

### What is Blank?
**Blank** is a high-frequency, desktop-native retail automation suite engineered in TypeScript, React 19, and Electron. Blank replaces slow, browser-based clicking with raw, protocol-level HTTP/2 requests, modern TLS client-hello fingerprint spoofing, and automated session maintenance.

```text
       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
       │   Blank Engine   │ ────> │  Proxy Gateway  │ ────> │ Retail Endpoints│
       │ (HTTP/2 + TLS)  │       │ (ISP / Resi)    │       │ (Amazon, etc.)  │
       └─────────────────┘       └─────────────────┘       └─────────────────┘
                │                         │                         │
         IMAP Worker (2FA)        Anti-Bot Clearance         Instant Checkout
```

### The Lifecycle of a Drop
1. **Monitor Phase**: Blank queries product status, price, and offer IDs with randomized headers through residential or datacenter proxies without burning session cookies.
2. **Trigger Phase**: The moment stock or an active pricing glitch is detected, the engine spawns checkout workers.
3. **Cart & Payload Generation**: Blank assembles cryptographically verified JSON payloads matching native mobile app or desktop browser signatures.
4. **Automated 2FA Verification**: If an OTP is requested, the background IMAP worker retrieves the 6-digit code from your email inbox in milliseconds.
5. **Checkout & Webhook**: The payment is settled, a signature sound alert plays, and confirmation details are dispatched to your private Discord webhook.

---

## 2. Quickstart & Installation

### System Requirements
- **Windows**: Windows 10 or 11 (64-bit)
- **macOS**: macOS 12.0 (Monterey) or later (Apple Silicon & Intel)
- **Memory**: Minimum 4GB RAM (8GB+ recommended for 50+ concurrent tasks)
- **Network**: Stable broadband connection or cloud VPS (e.g. AWS EC2, Google Cloud Compute Engine)

### Installation (Pre-Built Executable)
1. Download or extract the `win-unpacked` folder containing `Blank.exe`.
2. Double-click `Blank.exe` to launch the application.
3. On first launch, enter a master passphrase to initialize your local AES-256-GCM encryption vault.

### Building from Source
Ensure you have **Node.js 18+** installed on your system.

```bash
# 1. Clone the repository
git clone https://github.com/AqibMiah000/Blank-Bot.git
cd Blank-Bot

# 2. Install dependencies
npm install

# 3. Launch in development mode
npm run dev:electron

# 4. Compile production package with blank icon
npm run build:electron
```
The compiled, self-contained desktop package will be output to `release/win-unpacked/Blank.exe`.

---

## 3. Core System Architecture

Blank is built on a high-throughput, asynchronous pipeline:

```text
[ Electron Main Process ]
 ├── Task Engine (Event-driven concurrency, abort signals, backoff retry)
 ├── Crypto Vault (AES-256-GCM local credential storage)
 ├── IMAP Worker (Background email socket for automated 2FA harvesting)
 ├── Captcha Harvester Manager (Detached persistent Chrome window sessions)
 ├── Proxy Tester (Round-trip TCP latency & IP geo-resolution)
 ├── Discord Dispatcher (Real-time webhook notifications & remote commands)
 └── Audio Synthesizer (6 custom synthesized sound packs)

[ React 19 UI (Renderer) ]
 ├── Modern Refract-inspired interface
 ├── Mass Task Multiplier & CSV Importer
 ├── Native Harvester Command Center (Google & YouTube session warming)
 ├── 9 Stealth Themes (including Refract OLED & Stealth Midnight)
 ├── Live Freebies & Deals Feed (Instant Buy & OS browser redirect)
 └── System Metrics & Real-time Task Monitor
```

---

## 4. Tasks, Mass Quick-Import & Multipliers

Tasks represent individual purchasing threads. Organizing tasks into logical groups allows you to manage different drops and retailers simultaneously.

### Mass Quick-Import & Multiplier Modal
When a surprise drop occurs, you cannot afford to manually click "Create Task" 50 times. Blank provides a dedicated **Quick Import / Paste** modal:
- **SKU List Multiplier**: Paste 10, 50, or 100 ASINs/SKUs (one per line).
- **Auto-Profile Rotation**: Blank automatically cycles across all your billing profiles (`Profile 1`, `Profile 2`, `Profile 3`...) evenly across tasks.
- **Tasks Per SKU**: Generate 1x, 2x, 5x, or 10x tasks per product input.
- **CSV Importer**: Paste comma-separated lists (`retailer, input, profileId, proxyPoolId, monitorDelay, retryDelay`) to import hundreds of tasks in milliseconds.

### Fast Duplicate & Filter Pills
- **Duplicate Action**: Click the `Copy` icon on any task row to instantly clone it.
- **Status Filter Pills**: Quick-filter your active tasks by:
  - `All` — Total tasks in the current folder.
  - `Running` — Tasks actively monitoring, carting, or queueing.
  - `Idle` — Standby tasks ready to launch.
  - `Success` — Completed checkouts.
  - `Failed` — Tasks that encountered rate limits or out-of-stock conditions.

---

## 5. Retailer Modules & Strategies

### Amazon US
- **Supported Modes**: `Fast Checkout`, `Turbo Cart`, `1-Click Instant`
- **Session Types**: Saved Browser Cookie vs. Headless Account Sign-in
- **Offer ID Targeting**: For items sold by 3rd-party scalpers vs. Amazon Retail, Blank allows specifying the exact `offerListingID` to prevent purchasing overpriced third-party listings.
- **Best Practices**:
  - Keep accounts pre-warmed with default 1-Click payment methods.
  - Run monitoring tasks on rotating residential proxies with a 2500ms delay.
  - Switch checkout tasks to high-speed ISP proxies.

### Best Buy
- **Supported Modes**: `Queue Bypass`, `App API Token`, `Guest / Account Checkout`
- **Queue System**: Automatically monitors the Best Buy digital queue, solves backend challenge tokens, and proceeds to cart when granted access.
- **Best Practices**:
  - Use ISP proxies located close to Best Buy's origin servers (Ashburn, VA or Chicago, IL).

### Walmart
- **Supported Modes**: `Fast Mobile API`, `Desktop Flow`
- **Anti-Bot Handling**: Integrated with PerimeterX solver payloads to bypass sensor script detection during high-traffic restocks.

### Target
- **Supported Modes**: `RedCard Express`, `Standard Web Flow`
- **RedCard Integration**: Provides automated CVV resolution for 5% RedCard discounts and faster authorization.

### Apple
- **Supported Modes**: `In-Store Pickup Reservation`, `Direct Delivery`
- **Best Practices**: Ideal for high-demand launch day hardware (iPhone, MacBook Pro, Vision Pro).

---

## 6. Billing Profiles, VCCs & Address Jigging

### AES-256-GCM Local Vault
All sensitive billing details (card numbers, CVVs, expiration dates, addresses) are encrypted on your local machine using industry-standard **AES-256-GCM** before being written to disk. The decryption key is derived from your master passphrase and is never transmitted to any external server.

### Address Jigging
Retailers frequently cancel multiple orders sent to the identical shipping address. Blank allows you to "jig" your details:
- **Unit/Apartment Jig**: Automatically adds variations such as `Apt 101`, `Suite B`, `Unit 4A`, `Fl 2`.
- **Name Jig**: Adds randomized initials or middle names (e.g., `John D. Smith` vs `Johnathan Smith`).
- **Phone Jig**: Dynamically generates unique 10-digit telephone numbers mapped to your area code.

### Virtual Credit Cards (VCCs)
To prevent credit cards from getting flagged across multiple orders, pair Blank with modern VCC providers:
- **Privacy.com** (United States)
- **Capital One Eno**
- **Revolut** (UK/EU)
- **Stripe Issuing**

---

## 7. Proxy Pools & Network Management

Proxies mask your real IP address and prevent rate-limiting (HTTP 429 / 503) from retail servers.

### ISP (Datacenter) vs. Residential Proxies
```text
┌─────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Feature         │ ISP Proxies                   │ Residential Proxies           │
├─────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Speed / Latency │ Extremely Fast (5ms - 40ms)   │ Moderate (80ms - 300ms)       │
│ Ban Resistance  │ Medium                        │ Extremely High                │
│ Data Usage      │ Unlimited bandwidth           │ Pay-per-gigabyte              │
│ Best Use Case   │ High-speed checkout & carting │ Monitoring & scraping feeds   │
└─────────────────┴───────────────────────────────┴───────────────────────────────┘
```

### Supported Proxy Formats
```text
ip:port:username:password
ip:port
```

### Built-in Proxy Tester
Blank includes a built-in proxy latency tester. Benchmark your entire list against target retail endpoints (e.g., `https://www.amazon.com`) to filter out dead or throttled IPs before a drop.

---

## 8. Accounts & Automated IMAP 2FA Harvesting

### The 2FA Bottleneck
When logging in from a new proxy IP, Amazon, Best Buy, and Walmart often require an email verification code (OTP). Waiting to open a web browser and copy the code manually results in sold-out stock.

### How Blank Automates 2FA:
1. You configure an IMAP listener in Blank using your email and an **App-Specific Password** (e.g., Gmail App Password).
2. Blank establishes a secure background SSL connection (`imap.gmail.com:993`).
3. The instant an email arrives containing an authentication code, the IMAP worker parses the subject and body using regular expressions (`/\b\d{6}\b/`).
4. The OTP is injected directly into the pending login request within **200 milliseconds**—bypassing the login challenge completely hands-free.

---

## 9. Freebies & Deals Glitch Sniper

The **Freebies Sniper** is an automated scanning and sniping feed designed to catch zero-dollar glitches, mispriced inventory, and deep discount promotional errors.

### Features
- **Live Deal Stream**: Continuous monitoring of verified high-discount products and pricing anomalies.
- **Direct Amazon Redirect**: One-click redirect opens genuine product pages directly in your default OS browser (Chrome/Edge/Firefox).
- **Auto-Order / Instant Buy**: Configure max-price limits and target ASINs to auto-trigger purchase tasks immediately upon glitch detection.
- **Dedicated Audio Alert**: Distinct, customizable high-frequency chime to notify you the instant a glitch goes live.
- **Toggleable Visibility**: Turn the Freebies Sniper tab on or off in Settings to maintain a completely clean, focused interface.

---

## 10. Native Captcha Harvesters & Sensor Telemetry

In retail botting, maintaining a high reCAPTCHA v3 trust score (0.90) is the difference between an instant checkout and a blocked request.

### Native Detached Harvester Windows
Blank features a native **Captcha Harvester Command Center**:
- **Isolated Persistent Sessions**: Spawns detached Electron browser windows with independent cookies (`persist:harvester_1`, `persist:harvester_2`).
- **Google Account Login**: Click **Google** to log into a standard Google account inside the harvester. Having an active Google session automatically upgrades your reCAPTCHA v3 score from 0.30 to **0.90**.
- **YouTube Session Warming**: Click **YouTube** to stream videos in the background, simulating human browsing behavior to keep cookies warm.
- **Proxy Assignment**: Assign individual proxies to each harvester slot so captcha tokens are generated from the exact same subnet as your checkout tasks.
- **Test Harnesses**: Integrated with one-click test suites for reCAPTCHA v2/v3 and Cloudflare Turnstile.
- **Third-Party API Fallbacks**: Input keys for CapSolver, 2Captcha, or AntiCaptcha for hands-free background solving.

---

## 11. Settings, Sound Packs & Discord Remote Control

### 6 Real-Time Synthesized Sound Packs
No missing `.wav` or `.mp3` files. Blank synthesizes clean, pleasant audio alerts in real-time via the Web Audio API:
1. **Refract Cyan**: 4-tone high-pitched crystal chord (C6-D7 arpeggio).
2. **Cyber Laser**: High-voltage futuristic electronic laser ping.
3. **8-Bit Arcade**: Nostalgic retro level-up fanfare.
4. **Sub-Bass Thud**: Cinematic low-end impact with soft top transient.
5. **Haptic Click**: Crisp tactile mechanical switch sound.
6. **Mute Audio**: Silent stealth mode.

### Discord Remote Control & Webhooks
- **Rich Embed Confirmations**: Dispatches order confirmation with product SKU, price, masked profile, and checkout latency in milliseconds.
- **Remote Command Listener**: Enable the remote listener to control Blank from your mobile phone via Discord:
  - `/start [group]` — Start all tasks in a specific release group.
  - `/stop all` — Immediate emergency abort for all active workers.
  - `/status` — Get active task counts, success metrics, and proxy health.

### 9 Stealth UI Themes
1. **Refract OLED** (Pure `#000000` pitch black, `#0a0a0c` inset wells, cyan accent)
2. **Stealth Midnight** (Ultra-deep `#050507`, subtle platinum borders, monochrome silver)
3. **Cyberpunk Neon** (Dark violet background with high-voltage neon pink accents)
4. **Emerald Stealth** (Deep forest dark with luminous emerald green highlights)
5. **Tokyo Night** (Classic indigo night palette with vibrant violet-blue buttons)
6. **Carbon Minimal** (Raw industrial dark gray with warm amber orange accents)
7. **Crimson Protocol** (Black steel with sharp crimson red accents)
8. **Nordic Frost** (Arctic slate with crisp glacial cyan accents)
9. **Solar Gold** (Dark bronze slate with radiant gold highlights)

---

## 12. Troubleshooting & Error Directory

| Error Code | Root Cause | Solution |
| :--- | :--- | :--- |
| `ERR_PROXY_AUTH_FAIL` | Proxy credentials invalid or IP not whitelisted. | Verify username/password or authorize your home/server IP in your proxy dashboard. |
| `ERR_SESSION_EXPIRED` | Account session cookie or token timed out. | Re-authenticate account in the Accounts tab or trigger a login task. |
| `ERR_OUT_OF_STOCK` | Product ran out of stock before cart finalization. | Lower monitor delay and ensure ISP proxies have sub-50ms ping. |
| `ERR_PAYMENT_DECLINED`| Bank fraud trigger or insufficient funds on VCC. | Verify card balance or use an alternative VCC profile. |
| `ERR_IMAP_AUTH` | IMAP failed to connect to email provider. | Ensure 2-Step Verification is on and use a dedicated **App Password**, not your main email password. |
| `ERR_RATE_LIMITED` | Retailer detected excessive request frequency (HTTP 429). | Increase monitor delay or expand your proxy pool. |

---

<p align="center">
  <b>Blank</b> — Engineered for Speed, Precision, and Reliability.
</p>
