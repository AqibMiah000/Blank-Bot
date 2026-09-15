# ⬛ Blank — The Complete Beginner to Pro Walkthrough Guide

> **Welcome to Blank.**  
> This guide is designed so that **anyone**—even if you have never used a retail bot or automated checkout software before—can understand exactly how everything works, set up their first drop in under 3 minutes, and start catching restocks and price glitches effortlessly.

---

## 📑 Table of Contents

1. [What is Retail Automation? (Plain English)](#1-what-is-retail-automation-plain-english)
2. [The 5 Core Ingredients Every User Needs](#2-the-5-core-ingredients-every-user-needs)
3. [Quickstart: Your Very First Task in 3 Minutes](#3-quickstart-your-very-first-task-in-3-minutes)
4. [Where to Find Product Identifiers (ASINs & SKUs)](#4-where-to-find-product-identifiers-asins--skus)
5. [Mass Quick-Import & Multipliers (50 Tasks in 5 Seconds)](#5-mass-quick-import--multipliers-50-tasks-in-5-seconds)
6. [The Beginner’s Guide to Proxies](#6-the-beginners-guide-to-proxies)
7. [Automating 2FA with Gmail App Passwords](#7-automating-2fa-with-gmail-app-passwords)
8. [Captcha Harvesters: How to Get 0.90 Human Scores](#8-captcha-harvesters-how-to-get-090-human-scores)
9. [AYCD Toolbox Integration (AutoSolve & Profile Builder)](#9-aycd-toolbox-integration-autosolve--profile-builder)
10. [The Freebies & Pricing Glitch Sniper](#10-the-freebies--pricing-glitch-sniper)
11. [Live Market & TCG Intelligence Feed](#11-live-market--tcg-intelligence-feed)
12. [Address Jigging & Virtual Credit Cards (VCCs)](#12-address-jigging--virtual-credit-cards-vccs)
13. [Sound Packs, 17 Stealth Themes & Custom Studio](#13-sound-packs-17-stealth-themes--custom-studio)
14. [Troubleshooting & Error Code Glossary](#14-troubleshooting--error-code-glossary)
15. [Frequently Asked Questions (FAQ)](#15-frequently-asked-questions-faq)
16. [24/7 TCG Drop Radar & Local Store Pickup Sentinel (v1.30)](#16-247-tcg-drop-radar--local-store-pickup-sentinel-v130)
17. [Multi-Task Mass Edit & Quick-Task Drop Launcher](#17-multi-task-mass-edit--quick-task-drop-launcher)

---

## 1. What is Retail Automation? (Plain English)

When a high-demand item releases (like a new GPU, PlayStation console, limited Pokémon card box, or a \$0 pricing glitch on Amazon), thousands of people rush to the store page at the same second.

### Why Manual Shoppers Lose:
- A human has to look at the screen, click "Add to Cart", wait for the website to load, click "Proceed to Checkout", type their credit card and CVV, and click "Place Order".
- This takes **10 to 30 seconds**.
- By then, all inventory is gone.

### How Blank Wins:
- **Blank does not use a slow browser.** Instead, it communicates directly with the store’s checkout servers using raw, lightning-fast network requests.
- Blank detects when the item restocks, creates the cart, applies your payment, and finalizes checkout in **0.15 to 0.40 seconds**—completely hands-free while you sleep or work.

---

## 2. The 5 Core Ingredients Every User Needs

To run automated checkouts successfully, you need five simple things:

| Ingredient | What It Is | Why It Matters |
| :--- | :--- | :--- |
| **1. Tasks** | The instructions you give Blank | Tells Blank: *"Buy this Amazon item when it drops under \$50."* |
| **2. Profiles** | Your shipping and billing info | Tells Blank where to deliver the package and which card to charge. |
| **3. Proxies** | Alternate internet connections | Stops stores from blocking your home Wi-Fi for checking stock too fast. |
| **4. Accounts** | Store logins (Amazon, Best Buy) | Used for stores that require an active account to purchase. |
| **5. Harvesters** | Background login windows | Logs into Google to prevent stores from hitting you with picture puzzles. |

---

## 3. Quickstart: Your Very First Task in 3 Minutes

Follow these exact steps to set up your first working task:

### Step 1: Launch Blank
1. Open `Blank.exe` from the `release/win-unpacked/` folder.
2. The first time you launch, enter any secure **Master Encryption Passphrase** (e.g. `MyDropPass123!`). This encrypts your cards locally on your hard drive using AES-256-GCM.

### Step 2: Create a Billing Profile
1. Click the **Profiles** tab on the left sidebar.
2. Click **"New Profile"**.
3. Fill in your name, email, shipping address, and credit/debit card information.
4. Click **"Save Profile"**.
*(Note: Your card details are encrypted on your local computer; nothing is sent to external servers.)*

### Step 3: Create a Task
1. Click the **Tasks** tab on the left sidebar.
2. Click the blue **"Create Task"** button.
3. Select your **Retailer** (e.g. `Amazon US`).
4. In the **Product / Identifier** box, paste the item's ASIN (for example, `B0HFBMMSS6`).
5. Choose the **Billing Profile** you created in Step 2.
6. Leave **Proxy Pool** as `Direct / Local IP` for your first test task.
7. Leave **Monitor Delay** at `2500` ms and **Retry Delay** at `1000` ms.
8. Click **"Save Task"**.

### Step 4: Run the Task!
1. Look at your task in the list and click the green **Play (▶)** button.
2. You will see the status update to `MONITORING`.
3. Click the **Terminal (console icon)** next to the task to view real-time network logs.
4. When stock or a drop occurs, Blank automatically carts and places the order!

---

## 4. Where to Find Product Identifiers (ASINs & SKUs)

Retail stores identify products using unique codes instead of titles. Here is where to find them:

### Amazon US — The ASIN (10 Characters)
Every product on Amazon has a 10-character code called an **ASIN** in its URL:
- Example URL: `https://www.amazon.com/dp/B0HFBMMSS6`
- The ASIN is: **`B0HFBMMSS6`** (the code immediately following `/dp/`).
- Simply copy and paste that 10-character code into Blank!

### Best Buy US — The SKU (7 Digits)
On any Best Buy product page:
- Look right beneath the product title next to the model number.
- You will see: **`SKU: 6579999`**.
- Copy that 7-digit number into Blank.

### Walmart US — The Item ID (8 to 10 Digits)
On any Walmart product page URL:
- Example URL: `https://www.walmart.com/ip/Product-Name/123456789`
- The Item ID is the long number at the very end of the URL: **`123456789`**.

### Target — The TCIN
- Look in the URL or the "Specifications" section of the page for the **TCIN** (e.g. `81234567`).

---

## 5. Mass Quick-Import & Multipliers (50 Tasks in 5 Seconds)

During high-traffic releases, you often want to run multiple tasks across different items or cards. Blank makes this effortless:

1. Go to the **Tasks** tab.
2. Click the **"Quick Import / Paste"** button at the top.
3. In the text area, paste a list of ASINs or SKUs (one per line):
   ```text
   B0HFBMMSS6
   B0D1XD1ZV3
   B08FC5L3RG
   B09B8W5FW7
   ```
4. Under **Profile Allocation**, select:  
   👉 **`⚡ Auto-Rotate All Profiles`**  
   *(Blank will automatically distribute your tasks evenly across your cards so you don't trigger bank fraud limits!)*
5. Click **"Generate Tasks"**—and all 50 tasks are created instantly.

---

## 6. The Beginner’s Guide to Proxies

### Why Can't I Just Use My Home Wi-Fi?
If you ask Amazon or Best Buy "Is this item in stock?" 100 times in 1 minute from your home computer, the store's servers will recognize your IP address and temporarily block your home internet (giving you HTTP 429 Rate Limit errors).

**Proxies solve this.** A proxy acts as an internet middleman. When Blank sends a request through a proxy, the store sees the proxy's IP address instead of your home address.

### The Two Types of Proxies:
```text
┌─────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Proxy Type      │ How It Works                  │ When to Use It                │
├─────────────────┼───────────────────────────────┼───────────────────────────────┤
│ ISP / DC        │ High-speed static datacenter  │ Checkout & carting (Lightning │
│ (Datacenter)    │ connections (10ms - 40ms ping)│ fast, unlimited data usage).  │
├─────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Residential     │ Real home internet IP pool    │ 24/7 Monitoring & scraping    │
│ (Resi)          │ that changes every request.   │ (Impossible for stores to ban)│
└─────────────────┴───────────────────────────────┴───────────────────────────────┘
```

### How to Add Proxies into Blank:
1. Copy your proxy list from your proxy provider. They usually look like this:
   ```text
   198.51.100.1:8080:username:password
   198.51.100.2:8080:username:password
   ```
2. Go to the **Proxies** tab in Blank.
3. Click **"Add Proxy Pool"**, name it (e.g. `My ISP Pool`), and paste your list.
4. Click **"Test Pool"** to check the latency (ping) of every proxy in real-time.

---

## 7. Automating 2FA with Gmail App Passwords

When logging in from a new location or proxy, stores often ask for a **6-digit verification code** sent to your email. If you have to manually open your phone, unlock it, check your email, and type the code, the item will sell out.

### How Blank Automates 2FA in 150 Milliseconds:
Blank connects directly to your email inbox in the background over SSL. The instant an email from Amazon or Best Buy arrives, Blank reads the 6-digit code and enters it automatically.

### How to Set Up Gmail App Passwords (Step-by-Step):
1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2. Under "How you sign in to Google", ensure **2-Step Verification** is turned **ON**.
3. In the search bar at the top of the page, search for **"App passwords"**.
4. Create a new app password named **"Blank"**.
5. Google will display a 16-character code (e.g. `abcd efgh ijkl mnop`).
6. Open Blank's **Settings** tab:
   - Enter your Gmail address.
   - In the **IMAP Password** box, paste that 16-character code.
   - Click **"Save & Connect"**.
7. You will see a green badge: **`IMAP Worker: Connected`**. Your 2FA is now 100% automated!

---

## 8. Captcha Harvesters: How to Get 0.90 Human Scores

### Why Do Captchas Appear?
Stores use Google reCAPTCHA v3 or Cloudflare Turnstile to detect automated software.

### What is a "Trust Score"?
Google rates every browser session on a score from **0.10 to 0.90**:
- **0.10 - 0.30 (Bot)**: You get endless difficult picture puzzles (clicking traffic lights and crosswalks).
- **0.90 (Human)**: Captchas are solved invisibly in 0.05 seconds with zero puzzles.

### How to Use Blank’s Harvester Command Center:
1. Click the **Captchas** tab in Blank.
2. In **Harvester #1**, click **"Launch"**. A clean, detached browser window pops up.
3. Click the **"Google"** button inside the harvester and log into your personal Gmail/YouTube account.
4. Click **"YouTube"** and let a stream or playlist play quietly in the background.
5. **That's it!** Google now recognizes that harvester window as an active human browsing the web. When your tasks checkout, they borrow tokens from this window and bypass captchas instantly.

---

## 9. AYCD Toolbox Integration (AutoSolve & Profile Builder)

For advanced users and power botters, Blank includes native **1:1 integration with AYCD Toolbox**—the industry-standard companion platform used across high-frequency retail automation.

Blank provides direct, seamless interoperability with two major AYCD tools:
1. **AYCD AutoSolve / OneClick**: Automatically solves reCAPTCHA v2, reCAPTCHA v3, Cloudflare Turnstile, and hCaptcha challenges using your OneClick account farm.
2. **AYCD Profile Builder**: Instantly imports and exports your checkout profiles, shipping addresses, and virtual cards with hardware-level AES-256-GCM encryption.

---

### Part A: Connecting AYCD AutoSolve (OneClick)

AYCD AutoSolve connects Blank Bot directly to your running **AYCD OneClick** desktop application so you never have to manually solve puzzles during high-heat drops.

#### Step 1: Find Your Credentials in AYCD OneClick
1. Open your **AYCD OneClick** desktop application.
2. Click on **Settings** (gear icon) on the top bar.
3. Select the **AutoSolve** tab.
4. You will see two credentials:
   - **AutoSolve API Key**
   - **AutoSolve Access Token** (Click "Show" or "Generate" to copy it).

#### Step 2: Enter & Test Credentials in Blank
1. In Blank Bot, open the **Captchas** tab from the left sidebar.
2. Scroll down to the **AYCD AutoSolve & OneClick Integration** card.
3. Paste your **AutoSolve API Key** and **AutoSolve Access Token**.
4. Click the green **"Test AutoSolve Connection"** button.
5. Blank will ping your AutoSolve endpoint and display:  
   `✓ Connected to AYCD OneClick successfully! (Account Verified)`
6. Ensure the checkbox **"Auto-route checkout challenge tokens to AYCD OneClick during drops"** is enabled.
7. Click **"Save Solver API Keys"**.

#### How Drops Work With AutoSolve Enabled:
- When a task encounters a captcha challenge during checkout (such as Best Buy queue verification or Walmart human check), Blank sends an asynchronous token request to your AYCD OneClick instance.
- OneClick routes the request to your best-scoring farmed Google accounts (0.90 trust score).
- OneClick returns the solved token to Blank within **200ms to 400ms**, allowing the checkout to finalize seamlessly without human interaction.

---

### Part B: Syncing Profiles With AYCD Profile Builder

If you maintain tens or hundreds of shipping addresses and virtual cards (Privacy.com, Capital One Eno, Revolut) in AYCD Profile Builder, you can import them into Blank in 5 seconds.

#### How to Import From AYCD:
1. In **AYCD Profile Builder**, select your profiles or profile category and click **Export**. Choose either `.json` or `.csv`.
2. In Blank Bot, go to the **Profiles** tab on the left sidebar.
3. Click the purple/indigo **"AYCD Toolbox Sync"** button at the top.
4. Drag and drop your exported AYCD file into the upload zone (or paste the JSON/CSV text directly).
5. Blank immediately parses the file and presents a clean preview table of your profiles, recipient names, addresses, and card brands.
6. Click **"Import All Profiles"**.
7. Blank runs local client-side **AES-256-GCM hardware encryption** on every card number (PAN) and CVV before saving them into your secure local vault.

#### How to Export to AYCD:
- Blank also supports bidirectional export! If you create or jig profiles inside Blank and want to use them in other tools:
  1. Open the **"AYCD Toolbox Sync"** modal in Blank.
  2. Click the **"Export to AYCD"** tab.
  3. Click **"Download AYCD JSON File"** (or **"Copy to Clipboard"**).
  4. Import that file directly into AYCD Profile Builder or any compatible tool.

---

## 10. The Freebies & Pricing Glitch Sniper

Retailers and third-party sellers occasionally make pricing mistakes—such as listing a \$100 gaming headset for \$0.00, or stacking promo codes that take 95% off.

### How the Sniper Works:
- Blank continuously scans verified live deal channels for pricing anomalies on Amazon US.
- When an anomaly is detected, Blank plays a distinctive double-blip chime.
- **One-Click Redirect**: Click the deal row to open the authentic Amazon product page directly in your normal Google Chrome browser to inspect or purchase.
- **Instant Auto-Buy**: In the Freebies tab, set a **Max Price** (e.g. `1.00`). If a glitch under \$1.00 drops, Blank can automatically submit a purchase task.
- **Hide If Not Needed**: In Settings, you can toggle the Freebies Sniper tab off if you want a strictly minimalist restock interface.

---

## 11. Live Market & TCG Intelligence Feed

Blank features a built-in **Live Market & TCG Intelligence Feed** that tracks real-time market valuations, retail MSRP pricing, profit margins, and secondary resale velocity across trading cards, collectibles, and high-demand hardware.

### Why It's Powerful:
- **Zero Guesswork**: Instead of constantly switching between eBay completed listings, TCGPlayer market graphs, and StockX to see what products are actually profitable, Blank computes the live secondary market spread and ROI% right inside the application.
- **Multi-Category Filtering**: Click the **Categories** dropdown to select exactly what you care about:
  - 🃏 **Pokémon TCG**: High-velocity modern & classic sets (Prismatic Evolutions ETBs & Bundles, Surging Sparks Booster Boxes, Twilight Masquerade, Stellar Crown, Paldean Fates, 151, Crown Zenith Sea & Sky, Evolving Skies).
  - ⚓ **One Piece Card Game**: Hard-to-find booster boxes (OP-09 The Four Emperors, OP-08 Two Legends, OP-07 500 Years in the Future, OP-06 Wings of the Captain, OP-05, PRB-01 Premium Booster, EB-01).
  - ⚾ **Sports Cards**: Hobby & Mega boxes (2024 Panini Prizm Football Mega & Blasters, Absolute Football Kaboom chase, Topps Chrome Baseball, Select Basketball).
  - 🖥️ **PC Hardware & GPUs**: Enthusiast silicon (NVIDIA RTX 5090 / 5080 / 5070 Ti Founders Edition, AMD Ryzen 7 9800X3D, Ryzen 9 9950X3D).
  - 🎮 **Consoles & Handhelds**: PlayStation 5 Pro 30th Anniversary Bundle, PS5 Pro Standard, PlayStation Portal (30th Anniversary & Midnight Black), Nintendo Switch OLED.
- **Track Any Custom SKU or ASIN (`[+ Track Custom SKU]`)**:
  - Want to track a niche set, a specific GPU brand, or a new restock SKU?
  - Click **"Track Custom SKU"** in the top bar.
  - Select your retailer (**Amazon, Best Buy, Target, or Walmart**), paste the ASIN/SKU, choose your category, enter the MSRP and estimated resale value, and click **"Add to Live Tracker"**.
  - Your custom target appears instantly at the top of your feed with a `CUSTOM` badge, full profit analytics, and 1-Click Task Creation!
  - Delete any custom target anytime with the trash icon.
- **Manual Instant Refresh Button**: Hit **"↻ Refresh"** whenever you want an instant fresh quote feed without waiting for the automatic 3-minute background cache timer.
- **1-Click Task Creation (`[+ Create Task]`)**: See a high-ROI item you want to cop? Click **"Create Task"** on that product card. Blank automatically provisions a task for that retailer and SKU/ASIN, assigns it to your task group, logs the estimated profit spread, and takes you directly to the Tasks dashboard ready to run!
- **Toggleable in Settings**: Prefer a stripped-down UI? You can toggle the Market Analytics tab on or off anytime in **Settings → Modules & Navigation Tabs**.

---

## 12. Address Jigging & Virtual Credit Cards (VCCs)

Retailers frequently impose **"Limit 1 Per Customer"** rules on popular items. If you buy 3 items to the same name and address with the same card, the store will cancel all 3 orders.

### What is "Address Jigging"?
Address jigging means slightly modifying your street address so the store's computer thinks it is a different residence, but your mail carrier still delivers it to your front door:
- **Real Address**: `123 Main Street`
- **Jig 1**: `123 Main Street, Apt 1A`
- **Jig 2**: `123 Main Street, Suite B`
- **Jig 3**: `123 Main St, Unit 302`
- **Jig 4**: `123 Main Street, Fl 2`

### Virtual Credit Cards (VCCs)
Instead of using your physical bank card for every task, use Virtual Credit Cards from services like:
- **Privacy.com** (Creates unlimited virtual cards linked to your bank for US residents).
- **Capital One Eno** (Free virtual cards for Capital One cardholders).
- **Revolut** (Popular in the UK/EU).

Assign a different VCC to each profile in Blank so your transactions are never linked.

---

## 13. Sound Packs, 17 Stealth Themes & Custom Studio

### 6 Real-Time Synthesized Sound Packs
Blank doesn't rely on external `.wav` files that can get lost or deleted. It synthesizes audio in real-time:
1. **Refract Cyan**: Signature high-frequency 4-tone bell arpeggio.
2. **Cyber Laser**: Futuristic electronic confirmation ping.
3. **8-Bit Arcade**: Nostalgic retro game level-up sound.
4. **Sub-Bass Thud**: Cinematic low-end sub-bass impact.
5. **Haptic Click**: Crisp tactile mechanical click.
6. **Mute Audio**: Silent stealth operation.

Preview and choose your favorite in the **Settings** tab!

### 17 Stealth Themes & Custom Palette Studio
Under **Settings → UI Theme & Stealth Aesthetics**, customize Blank's dark-mode experience:
- **Searchable Theme Dropdown**: Pick from 17 handcrafted, authentic dark-mode presets (Refract OLED `#000000` pitch black, Stealth Midnight, Obsidian, Carbon Gold, Dracula Neon, Nordic Frost, Cyber Emerald, Crimson Protocol, Titanium Cobalt, Sunset Mirage, Synthwave 80s, Tokyo Cyberpunk, Royal Amethyst, Acid Volt, Phantom Smoke, Matcha Botanical, and Solar Flare).
- **Custom Theme Studio**:
  - Enter any hex code for **Primary (Accent)** (e.g. `#00F0FF`).
  - Enter any hex code for **Secondary (Base Surface)** (e.g. `#050507` or `#000000`).
  - Or click the circular swatches to pick visually using your computer's native color picker.
  - Click **"Apply Custom"**: Blank dynamically calculates harmonious surface shades, glow radii, and borders, applying them to the entire app instantly without restarting.
  - Selecting any preset from the dropdown also synchronizes the hex values into the custom studio so you can easily fine-tune existing themes.

### Discord Webhook & Mobile Remote Control
- **Discord Webhooks**: Paste your Discord channel webhook in Settings to receive celebratory embed cards with checkout speed (e.g. `240ms`), masked card, and order numbers.
- **Remote Commands**: Enable the remote listener in Settings to control Blank from Discord on your phone:
  - `/start [group]` — Starts all tasks in a group.
  - `/stop all` — Immediate emergency stop for all tasks.
  - `/status` — Sends a status summary of your active tasks and proxies.

---

## 14. Troubleshooting & Error Code Glossary

| Error Code | What Happened | How to Fix It |
| :--- | :--- | :--- |
| `ERR_PROXY_AUTH_FAIL` | Store rejected proxy credentials. | Check username/password in your proxy pool or make sure your home IP is authorized in your proxy dashboard. |
| `ERR_RATE_LIMITED` (HTTP 429) | You are checking stock too frequently. | Increase your **Monitor Delay** in task settings (e.g. from 1000ms to 2500ms) or add more proxies to your pool. |
| `ERR_OUT_OF_STOCK` | Stock ran out before checkout finished. | Normal on limited drops. Ensure your proxy ping is under 50ms and consider running more tasks. |
| `ERR_SESSION_EXPIRED` | Store account logged out. | Re-enter account password in the Accounts tab and trigger a session refresh. |
| `ERR_PAYMENT_DECLINED` | Card was declined by bank or store. | Check your VCC balance limit, ensure CVV is correct, or try a different card provider. |
| `ERR_IMAP_AUTH` | Email worker could not connect. | Ensure you are using a 16-character **Gmail App Password**, not your regular personal email password. |

---

## 15. Frequently Asked Questions (FAQ)

#### Q: Is Blank free to use?
**A:** Yes. Blank is completely free and unrestricted. There are zero subscription keys, zero seat locks, and unlimited task creation.

#### Q: Can I run Blank on a VPS (Cloud Server)?
**A:** Yes. Blank runs exceptionally well on Windows VPS providers (AWS EC2, Google Cloud, Vultr) located close to retailer datacenters (like Ashburn, Virginia) for 2ms to 5ms latency.

#### Q: How many tasks can I run at once?
**A:** On a standard 8GB/16GB RAM computer, you can comfortably run 50 to 200 concurrent tasks. Always ensure you have enough proxies so your IPs don't get throttled.

---

## 16. 24/7 TCG Drop Radar & Local Store Pickup Sentinel (v1.30)

Version 1.30 introduces the **24/7 TCG Drop Radar & Restock Sentinel**, giving you automated, around-the-clock restock detection for high-demand collectible trading card products across **Best Buy, Target, Walmart, and Amazon**.

### How It Works:
1. **Continuous 24/7 Inventory Listener**:
   - Blank's background daemon queries live retailer catalog endpoints at configurable intervals (e.g. 15s to 30s).
   - Monitors top-velocity sets including:
     - **Pokémon**: *Mega Evolution: Chaos Rising* Booster Boxes & ETBs, *Destined Rivals* Booster Bundles, *Journey Together* ETBs, *Prismatic Evolutions* Booster Bundles, and *Scarlet & Violet 151*.
     - **One Piece Card Game**: *The Azure Emperor [OP-10]*.
   - Uses sub-second state diffing: the instant an item transitions from `OUT_OF_STOCK` to `IN_STOCK`, an alert triggers immediately.

2. **Target & Walmart Local Store Pickup & Shelf Restock Radar**:
   - In the **TCG Radar** page, enable **"Scan In-Store / Curbside"**.
   - Enter your **5-digit US ZIP Code** (e.g. `90210`, `10001`, `75001`).
   - Select your **Search Radius**: `10 mi`, `25 mi`, or `50 mi`.
   - Blank queries local store fulfillment systems (Target RedSky `nearby_stores` / `pdp_client_v1` with store ID, and Walmart store locator) to detect:
     - Exact shelf stock counts at nearby branches (e.g. *Target - Beverly Hills West (#3991) • 6 units on shelf*).
     - Curbside drive-up readiness vs. in-store physical shelf availability.
     - Mileage from your ZIP code.

3. **Discord Drop Webhooks**:
   - Paste your Discord channel webhook URL into the **Discord Drop Webhook** input.
   - Click **"Send Test Drop Ping"** to verify formatting and connectivity.
   - Restock alerts dispatch rich Discord embeds with high-res product art, MSRP vs. market spread, branch location, distance in miles, and a direct reservation link.

4. **1-Click Auto-Snipe**:
   - Check the **"Auto-Snipe Drop Tasks"** toggle in the scanner settings.
   - When active, Blank won't just ping your Discord—it immediately spawns and executes a high-speed checkout task using your default profile and proxy pool before manual buyers can even open their notifications.

5. **Audio Chime Alerts on Drop Detection**:
   - Blank synthesizes an instant crystal audio chime via Web Audio when any online restock or physical shelf event is detected, notifying you immediately even if the app is minimized.
   - Click the **Volume** icon in the header to toggle audio alerts on/off or preview the chime sound.

6. **Physical "Check Nearby Shelves" Button**:
   - Located inside the **Local Shelf & Pickup Radar** card.
   - Click **"Check Nearby Shelves (ZIP [Your-ZIP])"** to manually force a scan of local store branches within your selected radius and immediately display confirmed shelf inventory.

7. **Overall Physical "Refresh All Channels" Button**:
   - Located in the top header bar and above the event feed.
   - Press **"Refresh All Channels"** at any time to execute an immediate, on-demand inventory check across Best Buy, Target, Walmart, and Amazon.

---

## 17. Multi-Task Mass Edit & Quick-Task Drop Launcher

Version 1.30 makes managing dozens or hundreds of tasks effortless with two new productivity features:

### 1. Multi-Task Mass Edit Modal
- In the **Tasks** tab, use the checkboxes on task rows (or click the header checkbox to select all).
- When 2 or more tasks are selected, a floating blue **"Mass Edit (N Tasks)"** action button appears at the top.
- Clicking it opens the **Mass Edit Modal**, allowing you to update:
  - **Billing Profile** (switch all selected tasks to a new card/address)
  - **Proxy Pool** (re-route all tasks to an ISP or residential pool)
  - **Execution Mode** (toggle between `FAST` direct protocol and `STEALTH` human emulation)
  - **Monitor Delay & Retry Delay**
  - **Drop Schedule Time** (synchronize launch timers across 50+ tasks in one click)

### 2. Inline Quick-Task Drop Launcher
- Located right in the **Tasks** page header bar.
- Paste any product URL (Amazon, Best Buy, Target, Walmart) or raw SKU/ASIN.
- Click **"Quick Task"** to instantly generate, configure, and launch a checkout task with your default profile and proxies in under 1 second.

---

<p align="center">
  <b>Blank</b> — Built for Speed. Designed for Precision. Engineered for Everyone.
</p>
