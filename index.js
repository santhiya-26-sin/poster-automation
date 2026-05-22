// npm install playwright googleapis

const fs           = require("fs");
const path         = require("path");
const readline     = require("readline");
const { chromium } = require("playwright");
const { google }   = require("googleapis");

// ─────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────
const CONFIG = {
  profileDir:      "D:\\poster-automation\\chrome-profile",
  promptTimeoutMs: 240_000,
  replyTimeoutMs:  120_000,
  loginTimeoutMs:  600_000,
  driveFolderId:   "1KxkGIgE2M69hubz7OtEG7UQPWcCwna8J",

  // ── Scheduled time (24hr format) ──
  scheduleHour:   16,
  scheduleMinute: 3,
};

// ─────────────────────────────────────────
//  PROMPT FILES
//  Create these 4 files manually in
//  D:\poster-automation\ and paste your
//  prompts into them before running.
// ─────────────────────────────────────────
const PROMPT_FILES = [
  "D:\\poster-automation\\prompt1.txt",
  "D:\\poster-automation\\prompt2.txt",
  "D:\\poster-automation\\prompt3.txt",
  "D:\\poster-automation\\prompt4.txt",
];

// ─────────────────────────────────────────
//  PICK A RANDOM PROMPT
// ─────────────────────────────────────────
function getRandomPrompt() {
  // Check all files exist
  PROMPT_FILES.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Prompt file not found: ${filePath}\nPlease create it and paste your prompt inside.`);
    }
  });

  const idx      = Math.floor(Math.random() * PROMPT_FILES.length);
  const filePath = PROMPT_FILES[idx];
  const prompt   = fs.readFileSync(filePath, "utf8").trim();
  log(`Using prompt ${idx + 1} of 4 → ${filePath}`);
  return prompt;
}

// ─────────────────────────────────────────
//  SCHEDULER
// ─────────────────────────────────────────
async function waitUntilScheduledTime() {
  const now    = new Date();
  const target = new Date();
  target.setHours(CONFIG.scheduleHour, CONFIG.scheduleMinute, 0, 0);

  // If scheduled time already passed today, run tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const waitMs  = target - now;
  const waitMin = Math.round(waitMs / 60000);

  log(`Scheduled time: ${CONFIG.scheduleHour}:${String(CONFIG.scheduleMinute).padStart(2, "0")}`);
  log(`Waiting ${waitMin} minute(s)... Next run: ${target.toLocaleString()}`);

  await new Promise((resolve) => setTimeout(resolve, waitMs));
  log("Scheduled time reached! Starting workflow...");
}

// ─────────────────────────────────────────
//  LOGGING
// ─────────────────────────────────────────
function log(msg, isError = false) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${isError ? "[ERROR]" : "[INFO] "} ${msg}`);
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
    const count      = await candidates.count();
    log(`Scanning for image... ${count} candidate(s)`);

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
//  GOOGLE DRIVE AUTH
// ─────────────────────────────────────────
async function getAuthClient() {
  const creds = JSON.parse(fs.readFileSync("D:\\poster-automation\\oauth-credentials.json"));
  const { client_secret, client_id, redirect_uris } = creds.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const tokenPath = "D:\\poster-automation\\token.json";
  if (fs.existsSync(tokenPath)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(tokenPath)));
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });

  console.log("\nOpen this URL in your browser and login:\n", authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise((resolve) => rl.question("\nPaste the code here: ", resolve));
  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(tokenPath, JSON.stringify(tokens));
  log("Token saved!");
  return oAuth2Client;
}

// ─────────────────────────────────────────
//  UPLOAD TO GOOGLE DRIVE
// ─────────────────────────────────────────
async function uploadToDrive(filePath) {
  log("Authenticating with Google Drive...");
  const auth  = await getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  log("Uploading file...");
  const res = await drive.files.create({
    requestBody: {
      name:    path.basename(filePath),
      parents: [CONFIG.driveFolderId],
    },
    media: {
      mimeType: "image/png",
      body:     fs.createReadStream(filePath),
    },
    fields: "id, webViewLink",
  });

  log(`Uploaded! File ID: ${res.data.id}`);
  log(`View: ${res.data.webViewLink}`);
  return res.data.webViewLink;
}

// ─────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────
(async () => {
  let context;
  try {
    // Wait until scheduled time
    await waitUntilScheduledTime();

    // Pick a random prompt from the 4 files
    const PROMPT = getRandomPrompt();

    log("Launching Chrome...");
    context = await chromium.launchPersistentContext(CONFIG.profileDir, {
      headless:        false,
      channel:         "chrome",
      acceptDownloads: true,
      viewport:        { width: 1400, height: 900 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      args: [
        "--profile-directory=Default",
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

    // Step 1: Open ChatGPT
    log("Opening ChatGPT...");
    await page.goto("https://chatgpt.com", { waitUntil: "domcontentloaded", timeout: 60_000 });
    log("Waiting for chat input...");
    await page.waitForSelector("div[contenteditable='true']", {
      state: "visible", timeout: CONFIG.loginTimeoutMs,
    });
    await page.waitForTimeout(2_000);

    // Step 2: Send prompt
    log("Sending prompt...");
    await sendMessage(page, PROMPT);

    // Step 3: Wait for image
    log("Waiting for poster image...");
    const img = await waitForGeneratedImage(page, CONFIG.promptTimeoutMs);
    const src = await img.getAttribute("src");
    if (!src) throw new Error("Image has no src attribute");

    // Step 4: Save with timestamp so old posters are never overwritten
    const timestamp  = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const outputFile = `D:\\poster-automation\\poster-${timestamp}.png`;
    await saveImage(page, src, outputFile);
    log(`Poster saved → ${outputFile}`);

    // Step 5: Upload to Drive
    await uploadToDrive(outputFile);

    console.log("\n✅  Done.");

  } catch (err) {
    log(`Workflow failed: ${err.message}`, true);
    process.exitCode = 1;
  } finally {
    if (context) await context.close();
  }
})();