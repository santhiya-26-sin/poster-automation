// npm install playwright

const fs           = require("fs");
const path         = require("path");
const { chromium } = require("playwright");
const { google } = require("googleapis");

// ─────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────
const CONFIG = {
  profileDir:      "D:\\poster-automation\\chrome-profile",
  outputFile:      "D:\\poster-automation\\refinancing-poster.png",
  promptTimeoutMs: 240_000,
  replyTimeoutMs:  120_000,
  loginTimeoutMs:  600_000,
  driveFolderId:   "1KxkGIgE2M69hubz7OtEG7UQPWcCwna8J",
};

// ─── Original prompt — untouched ───
const PROMPT = `Generate a high quality image of a premium minimalist advertisement poster for Karthik Mortgage.

You are a bold graphic designer who believes in the power of less. Create a minimalist advertisement poster for Karthik Mortgage — home refinancing made simple.

BRAND DETAILS (always include):
— Brand: KARTHIK MORTGAGE
— Phone: (571) 457-1894
— Website: www.karthikmortgage.com
— Colors: Orange (#FF6B00), white, black
— Disclaimer: "Equal Housing Lender. NMLS ID #XXXXX"

THE GOLDEN RULE
Maximum 7 elements on the entire poster. Count them. If you have more — remove something.

STEP 1 — ONE IDEA ONLY
Choose a single visual idea that communicates refinancing. One object. One moment. One truth.
Examples of the thinking style (do not reuse):
— A single house made of one continuous line
— A percentage sign slowly shrinking
— A door slightly open with warm light inside
— One bold number: the rate
— A house casting a shadow shaped like a dollar sign
Invent something original. It must work with almost nothing around it.

STEP 2 — LAYOUT
Pick one layout, or invent your own:
— Top: logo / Middle: giant visual / Bottom: headline + CTA
— Left: headline / Right: single illustration
— Full bleed single image, text anchored to one corner
— One giant word fills the poster, small details within it
— Near-empty white space with one small powerful image centered
Generous white space is not emptiness — it is confidence.

STEP 3 — COPY (Less is more)
HEADLINE: 1 to 4 words only. Punchy. Memorable.
SUBLINE: 1 sentence. Maximum 10 words.
CTA: 2 to 4 words on a clean orange button.
No bullet points. No feature lists. No icons row. No speech bubbles. No starburst shapes.

STEP 4 — VISUAL STYLE
— Background: solid white or solid black only
— One accent color: orange used sparingly (one element)
— Typography: one font family, two weights maximum
— Illustration style: flat, line art, or simple 3D object
— NOT cartoon mascots — NOT busy scenes — NOT multiple characters
— Shadows: one soft shadow maximum if needed
— Negative space must occupy at least 60% of the poster

FIXED SPECS
— Size: 1080x1350px portrait
— Print-ready, high resolution

NEVER
— More than 7 visual elements total
— Cartoon mascots or characters
— Icon grids or feature lists
— Speech bubbles or starbursts
— More than 2 font weights
— Gradient backgrounds
— Decorative borders or frames
— Multiple illustrations

Output only the image. No explanation. No text response.`;


// ─────────────────────────────────────────
//  LOGGING
// ─────────────────────────────────────────
function log(msg, isError = false) {
  console.log(`${isError ? "[ERROR]" : "[INFO] "} ${msg}`);
}

// ─────────────────────────────────────────
//  SEND A MESSAGE
// ─────────────────────────────────────────
async function sendMessage(page, text) {
  await page.evaluate((t) => navigator.clipboard.writeText(t), text);
  const textarea = page.locator("div[contenteditable='true']").first();
  await textarea.click();
  await page.waitForTimeout(400);
  await page.keyboard.press("Control+v");
  await page.waitForTimeout(1_200);

  const sendBtn = page.locator(
    '[data-testid="send-button"], button[aria-label="Send prompt"]'
  ).first();

  for (let i = 0; i < 15; i++) {
    const disabled = await sendBtn.getAttribute("disabled").catch(() => "true");
    if (!disabled) { await sendBtn.click(); log("Message sent."); return; }
    await page.waitForTimeout(1_000);
  }
  throw new Error("Send button never became enabled");
}

// ─────────────────────────────────────────
//  WAIT UNTIL CHATGPT FULLY STOPS
// ─────────────────────────────────────────
async function waitForResponseComplete(page, timeoutMs) {
  const start   = Date.now();
  const stopSel = '[data-testid="stop-button"], button[aria-label="Stop generating"]';

  log("Waiting for ChatGPT to start responding…");
  await page.waitForSelector(stopSel, { timeout: 20_000 }).catch(() => null);
  log("Generation in progress…");

  while (Date.now() - start < timeoutMs) {
    const visible = await page.locator(stopSel).isVisible().catch(() => false);
    if (!visible) {
      await page.waitForTimeout(2_000);
      const stillVisible = await page.locator(stopSel).isVisible().catch(() => false);
      if (!stillVisible) { log("ChatGPT finished responding."); return; }
    }
    await page.waitForTimeout(1_500);
  }
  throw new Error("Timed out waiting for ChatGPT to finish");
}

// ─────────────────────────────────────────
//  CHECK IF IMAGE ALREADY PRESENT
// ─────────────────────────────────────────
async function imageAlreadyPresent(page) {
  const sel = [
    'img[src*="oaiusercontent"]',
    'img[src*="estuary"]',
    'img[src*="file-service"]',
    '[data-testid="image-container"] img',
  ].join(", ");

  const candidates = page.locator(sel);
  const count = await candidates.count();
  for (let i = 0; i < count; i++) {
    const src    = await candidates.nth(i).getAttribute("src").catch(() => "");
    const loaded = await candidates.nth(i).evaluate((el) => el.naturalWidth > 0).catch(() => false);
    if (loaded && src && !src.includes("avatar") && !src.includes("logo")) return true;
  }
  return false;
}

// ─────────────────────────────────────────
//  WAIT FOR GENERATED IMAGE
// ─────────────────────────────────────────
async function waitForGeneratedImage(page, timeoutMs) {
  const start = Date.now();
  const sel = [
    'img[src*="oaiusercontent"]',
    'img[src*="estuary"]',
    'img[src*="file-service"]',
    'img[alt*="generated"]',
    '.group img',
    'article img',
    '[data-testid="image-container"] img',
  ].join(", ");

  while (Date.now() - start < timeoutMs) {
    const candidates = page.locator(sel);
    const count = await candidates.count();
    log(`Scanning for image… ${count} candidate(s)`);

    for (let i = 0; i < count; i++) {
      const img    = candidates.nth(i);
      const src    = await img.getAttribute("src").catch(() => "");
      const loaded = await img.evaluate((el) => el.naturalWidth > 0).catch(() => false);
      if (loaded && src && !src.includes("avatar") && !src.includes("logo")) {
        log(`Image found: ${src.substring(0, 70)}`);
        await img.scrollIntoViewIfNeeded();
        return img;
      }
    }
    await page.waitForTimeout(2_000);
  }
  throw new Error("Timed out waiting for generated image");
}

// ─────────────────────────────────────────
//  SAVE IMAGE
// ─────────────────────────────────────────
async function saveImage(page, src, outputPath) {
  if (src.startsWith("data:")) {
    fs.writeFileSync(outputPath, Buffer.from(src.split(",")[1], "base64"));
    return;
  }
  const base64 = await page.evaluate(async (url) => {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const buf = await res.arrayBuffer();
    const u8  = new Uint8Array(buf);
    let b = "";
    u8.forEach((x) => (b += String.fromCharCode(x)));
    return btoa(b);
  }, src);
  fs.writeFileSync(outputPath, Buffer.from(base64, "base64"));
}

// ─────────────────────────────────────────
//  UPLOAD TO GOOGLE DRIVE
//  Injects the file directly into Drive's
//  hidden <input type="file"> element —
//  bypasses the New → File upload dropdown
//  entirely. No API, no OAuth needed.
// ─────────────────────────────────────────
async function uploadToDrive(context, filePath) {
  log(`File exists: ${fs.existsSync(filePath)} — Path: ${filePath}`);
  log("Opening Google Drive folder…");
  const drive = await context.newPage();

  await drive.goto(
    `https://drive.google.com/drive/folders/${CONFIG.driveFolderId}`,
    { waitUntil: "domcontentloaded", timeout: 60_000 }
  );
  await drive.waitForTimeout(5_000);

  log("Clicking New button…");
  await drive.locator('[aria-label="New"], [data-tooltip="New"]').first().click();
  await drive.waitForTimeout(2_000);

  log("Clicking File upload…");
  await drive.evaluate(() => {
    const items = document.querySelectorAll('[role="menuitem"]');
    for (const item of items) {
      if (item.innerText.includes("File upload")) {
        item.click();
        break;
      }
    }
  });
  await drive.waitForTimeout(3_000);

  log("Setting file on input…");
  const fileInput = drive.locator('input[type="file"]').first();
  await fileInput.setInputFiles(filePath);

  // Wait for upload progress to appear
  log("Waiting for upload to start…");
  await drive.waitForSelector(
    '[aria-label*="uploading"], [aria-label*="Upload"], .a-s-fa-Ha-pa, [data-progress]',
    { timeout: 15_000 }
  ).catch(() => log("Upload progress indicator not found — continuing…"));

  // Wait longer for upload to actually finish
  log("Waiting for upload to finish…");
  await drive.waitForTimeout(15_000);

  await drive.screenshot({ path: "D:\\poster-automation\\debug-drive.png" });

  const url = `https://drive.google.com/drive/folders/${CONFIG.driveFolderId}`;
  log(`Upload complete → ${url}`);
  await drive.close();
  return url;
}
// ─────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────
(async () => {
  let context;
  try {
    log("Launching Chrome…");
    context = await chromium.launchPersistentContext(CONFIG.profileDir, {
      headless:        false,
      channel:         "chrome",
      acceptDownloads: true,
      viewport:        { width: 1400, height: 900 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-infobars",
        "--disable-dev-shm-usage",
        "--start-maximized",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    const page = context.pages()[0] || await context.newPage();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.waitForTimeout(3_000);

    // ── Step 1: ChatGPT ──
    log("Opening ChatGPT…");
    await page.goto("https://chatgpt.com", { waitUntil: "domcontentloaded", timeout: 60_000 });
    log("Waiting for chat input…");
    await page.waitForSelector("div[contenteditable='true']", {
      state: "visible", timeout: CONFIG.loginTimeoutMs,
    });
    await page.waitForTimeout(2_000);

    // ── Step 2: Send prompt ──
    log("Sending prompt…");
    await sendMessage(page, PROMPT);

    // ── Step 3: Wait for image ──
    log("Waiting for poster image…");
    const img = await waitForGeneratedImage(page, CONFIG.promptTimeoutMs);
    const src = await img.getAttribute("src");
    if (!src) throw new Error("Image has no src attribute");

    // ── Step 4: Save ──
    await saveImage(page, src, CONFIG.outputFile);
    log(`Poster saved → ${CONFIG.outputFile}`);

    // ── Step 5: Upload to Drive ──
    const folderUrl = await uploadToDrive(context, CONFIG.outputFile);
    console.log("\n✅  Done.");

  } catch (err) {
    log(`Workflow failed: ${err.message}`, true);
    process.exitCode = 1;
  } finally {
    if (context) await context.close();
  }
})();