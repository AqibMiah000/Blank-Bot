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
9. [The Freebies & Pricing Glitch Sniper](#9-the-freebies--pricing-glitch-sniper)
10. [Address Jigging & Virtual Credit Cards (VCCs)](#10-address-jigging--virtual-credit-cards-vccs)
11. [Sound Packs & Discord Remote Control](#11-sound-packs--discord-remote-control)
12. [Troubleshooting & Error Code Glossary](#12-troubleshooting--error-code-glossary)
13. [Frequently Asked Questions (FAQ)](#13-frequently-asked-questions-faq)

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

## 9. The Freebies & Pricing Glitch Sniper

Retailers and third-party sellers occasionally make pricing mistakes—such as listing a \$100 gaming headset for \$0.00, or stacking promo codes that take 95% off.

### How the Sniper Works:
- Blank continuously scans verified live deal channels for pricing anomalies on Amazon US.
- When an anomaly is detected, Blank plays a distinctive double-blip chime.
- **One-Click Redirect**: Click the deal row to open the authentic Amazon product page directly in your normal Google Chrome browser to inspect or purchase.
- **Instant Auto-Buy**: In the Freebies tab, set a **Max Price** (e.g. `1.00`). If a glitch under \$1.00 drops, Blank can automatically submit a purchase task.
- **Hide If Not Needed**: In Settings, you can toggle the Freebies Sniper tab off if you want a strictly minimalist restock interface.

---

## 10. Address Jigging & Virtual Credit Cards (VCCs)

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

## 11. Sound Packs & Discord Remote Control

### 6 Real-Time Synthesized Sound Packs
Blank doesn't rely on external `.wav` files that can get lost or deleted. It synthesizes audio in real-time:
1. **Refract Cyan**: Signature high-frequency 4-tone bell arpeggio.
2. **Cyber Laser**: Futuristic electronic confirmation ping.
3. **8-Bit Arcade**: Nostalgic retro game level-up sound.
4. **Sub-Bass Thud**: Cinematic low-end sub-bass impact.
5. **Haptic Click**: Crisp tactile mechanical click.
6. **Mute Audio**: Silent stealth operation.

Preview and choose your favorite in the **Settings** tab!

### Discord Webhook & Mobile Remote Control
- **Discord Webhooks**: Paste your Discord channel webhook in Settings to receive celebratory embed cards with checkout speed (e.g. `240ms`), masked card, and order numbers.
- **Remote Commands**: Enable the remote listener in Settings to control Blank from Discord on your phone:
  - `/start [group]` — Starts all tasks in a group.
  - `/stop all` — Immediate emergency stop for all tasks.
  - `/status` — Sends a status summary of your active tasks and proxies.

---

## 12. Troubleshooting & Error Code Glossary

| Error Code | What Happened | How to Fix It |
| :--- | :--- | :--- |
| `ERR_PROXY_AUTH_FAIL` | Store rejected proxy credentials. | Check username/password in your proxy pool or make sure your home IP is authorized in your proxy dashboard. |
| `ERR_RATE_LIMITED` (HTTP 429) | You are checking stock too frequently. | Increase your **Monitor Delay** in task settings (e.g. from 1000ms to 2500ms) or add more proxies to your pool. |
| `ERR_OUT_OF_STOCK` | Stock ran out before checkout finished. | Normal on limited drops. Ensure your proxy ping is under 50ms and consider running more tasks. |
| `ERR_SESSION_EXPIRED` | Store account logged out. | Re-enter account password in the Accounts tab and trigger a session refresh. |
| `ERR_PAYMENT_DECLINED` | Card was declined by bank or store. | Check your VCC balance limit, ensure CVV is correct, or try a different card provider. |
| `ERR_IMAP_AUTH` | Email worker could not connect. | Ensure you are using a 16-character **Gmail App Password**, not your regular personal email password. |

---

## 13. Frequently Asked Questions (FAQ)

#### Q: Is Blank free to use?
**A:** Yes. Blank is completely free and unrestricted. There are zero subscription keys, zero seat locks, and unlimited task creation.

#### Q: Can I run Blank on a VPS (Cloud Server)?
**A:** Yes. Blank runs exceptionally well on Windows VPS providers (AWS EC2, Google Cloud, Vultr) located close to retailer datacenters (like Ashburn, Virginia) for 2ms to 5ms latency.

#### Q: How many tasks can I run at once?
**A:** On a standard 8GB/16GB RAM computer, you can comfortably run 50 to 200 concurrent tasks. Always ensure you have enough proxies so your IPs don't get throttled.

---

<p align="center">
  <b>Blank</b> — Built for Speed. Designed for Precision. Engineered for Everyone.
</p>
