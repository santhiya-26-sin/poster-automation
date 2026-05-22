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



    // ── Upload to Drive test ──
    log("Using existing image for Drive upload test…");
    const folderUrl = await uploadToDrive(context, CONFIG.outputFile);





    // npm install playwright
    
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
      outputFile:      "D:\\poster-automation\\refinancing-poster.png",
      promptTimeoutMs: 240_000,
      replyTimeoutMs:  120_000,
      loginTimeoutMs:  600_000,
      driveFolderId:   "1KxkGIgE2M69hubz7OtEG7UQPWcCwna8J",
    };
    
    // ─── Original prompt — untouched ───
    const PROMPT = `You are a top creative director specializing in bold, energetic, 
    mascot-driven financial marketing. Generate a vibrant animated 
    advertisement poster for **Karthik Mortgage** — a friendly, 
    approachable home refinancing brand.
    
    BRAND IDENTITY (from existing materials):
    — Brand name: KARTHIK MORTGAGE
    — Logo: Bold "K" with house icon integrated
    — Brand colors: Bright orange (#FF6B00), clean white, black accents
    — Brand voice: Energetic, friendly, optimistic, action-oriented
    — Phone: (571) 457-1894
    — Website: www.karthikmortgage.com
    — Email: sandeepsmr85@gmail.com
    — Disclaimer: "Karthik Mortgage is an Equal Housing Lender. 
      NMLS ID #XXXXX | Information is subject to change without notice. 
      Terms and conditions apply."
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🎭  STEP 1 — INVENT A UNIQUE MASCOT SCENARIO (Fresh every time)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    Invent ONE original mascot scene. The mascot can be:
    — The animated house character (running, celebrating, jumping, 
      flying, holding a banner, surfing a wave of coins, etc.)
    — A friendly cartoon human advisor (different ethnicity, outfit, 
      pose, expression each time)
    — A duo — house mascot + human advisor interacting
    — An entirely new mascot concept invented for this generation
      (a cartoon piggy bank, a superhero homeowner, a friendly 
      dollar sign character, a cartoon family, etc.)
    
    The mascot must:
    — Have a clear personality expressed through pose and expression
    — Be doing something active and story-telling, not just standing
    — Interact with the poster's message physically 
      (pointing at a number, lifting a house, bursting through text, 
      riding a percentage sign downward like a slide, etc.)
    — Feel like a Saturday morning cartoon meets premium fintech
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🎨  STEP 2 — INVENT THE VISUAL LAYOUT (Original every generation)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    Design a completely new layout structure each time. Options include 
    but are NOT limited to:
    
    COMPOSITION IDEAS (invent your own or use these as inspiration):
    — Rocket launch: mascot riding upward rocket with rate numbers 
      falling like confetti
    — Stadium scoreboard: giant scoreboard showing old rate vs new rate, 
      crowd cheering below
    — Before/After split: left side dark/heavy (old mortgage), 
      right side bright/orange (Karthik Mortgage)
    — Treasure map: illustrated map leading to "Lower Rates" as X marks the spot
    — Trophy podium: mascot on #1 podium, competitors far below
    — Superhero landing: mascot in cape crashing down with impact rings, 
      "SAVINGS" exploding outward
    — Game show set: "DEAL OR NO DEAL" style with rate reveals
    — Comic book panels: 3-4 panels telling a savings story
    — Giant piggy bank smashing open with savings flying out
    — Mortgage mountain being climbed, Karthik flag at the summit
    — News headline style: breaking news ticker about lower rates
    — Sports trading card format for the brand mascot
    — Completely invent something not listed above
    
    BACKGROUND:
    — Invent a background that matches the scene energy
    — Can be: cityscape, neighborhood, abstract burst, 
      comic dot pattern, gradient explosion, sky scene, 
      illustrated environment, or anything that serves the concept
    — Must use orange + white as dominant colors with black for contrast
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ✍️  STEP 3 — WRITE ALL COPY FROM SCRATCH (Nothing templated)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    Write everything fresh, driven by your mascot scenario:
    
    MAIN HEADLINE (Big, bold, punchy — 3 to 6 words max)
       Must be energetic, action-oriented, and impossible to ignore.
       Written in ALL CAPS. Tied to your mascot scenario.
       Examples of ENERGY LEVEL required (do not reuse these):
       — "LOWER RATES. BIGGER LIFE."
       — "YOUR MORTGAGE. YOUR RULES."
       — "STOP OVERPAYING. START SAVING."
       Invent something completely new.
    
    SPEECH BUBBLE / ACCENT COPY (1 punchy phrase)
       Short, witty, conversational. Goes in a speech bubble or 
       starburst shape. Tied to mascot action.
    
    BENEFIT STATEMENTS (Invent 3, tied to this poster's concept)
       Not a generic list — write them with personality.
       Each one should feel like the mascot is speaking directly.
    
    FEATURE ICONS SECTION (Invent 3–4 features with descriptions)
       Write section header fresh ("Why Homeowners Love Karthik" 
       or invent something better).
       Each feature: icon concept + bold title + 1–2 sentence description.
       Features must be relevant to refinancing but framed uniquely.
    
    CTA (Write it fresh, tied to the campaign energy)
       The button/banner text and the supporting line beneath it.
       Must feel urgent but friendly, not corporate.
    
    TAGLINE (Invent one for this poster only)
       A short brand tagline that captures the poster's spirit.
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🎬  STEP 4 — ANIMATION DIRECTION (Invent the motion)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    Design animation that matches your mascot scenario energy:
    
    OPENING (0–1 second)
       How does the poster reveal? Slam in? Burst open? 
       Wipe from corner? Mascot jumps in from off-screen?
    
    MASCOT ANIMATION (looping)
       What is the mascot's idle loop animation?
       (bouncing, waving, blinking, breathing, tail wagging, etc.)
    
    HEADLINE ANIMATION
       How does the headline behave? Stamp in? Inflate? 
       Shake for emphasis? Bounce letter by letter?
    
    ACCENT ANIMATIONS
       What small looping details keep the eye moving?
       (spinning icons, blinking stars, pulsing CTA button, 
       floating coins, animated arrows, etc.)
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📐  FIXED TECHNICAL SPECS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    — Format: Portrait A4 / 1080×1350px
    — Resolution: High resolution, print-ready
    — Style: Bold cartoon illustration + 3D mascot rendering
    — Colors: Bright orange, white, black — clean and punchy
    — Typography: Bold rounded display fonts, heavy weight, 
      high contrast between headline sizes
    — Must include: Karthik Mortgage logo area (top), phone number 
      (bottom), website, email, Equal Housing disclaimer
    — Rendering: Vivid, clean, high-contrast — NOT photorealistic, 
      NOT luxury, NOT dark
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🚫  ABSOLUTE PROHIBITIONS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    NEVER produce a dark, moody, or "luxury" aesthetic
    NEVER use muted, pastel, or desaturated colors
    NEVER write generic copy ("Get your dream home today")
    NEVER repeat a mascot pose or scenario from any prior generation
    NEVER use a centered symmetrical layout with no dynamic elements
    NEVER make the mascot static — it must always be in motion or action
    NEVER remove the contact information and legal disclaimer
    NEVER use purple, navy, green, or cool tones as dominant colors
    NEVER produce a corporate, stiff, or boring composition
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ✅  REQUIRED DECLARATION BEFORE GENERATING
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    State this before generating the poster:
    
      MASCOT: [Who/what is the mascot this generation]
      SCENARIO: [What is the mascot doing and why]
      LAYOUT CONCEPT: [What is the overall composition structure]
      HEADLINE: [Your invented headline]
      SPEECH BUBBLE: [Your accent copy]
      CTA: [Your call to action]
      ANIMATION HOOK: [The primary motion that makes this feel alive]
      CREATIVE TWIST: [The one unexpected element that makes this unique]
    
    Generate the poster based on exactly this brief.
    
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
    
    async function getAuthClient() {
      const creds   = JSON.parse(fs.readFileSync("D:\\poster-automation\\oauth-credentials.json"));
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
    
    async function uploadToDrive(filePath) {
      log("Authenticating with Google Drive…");
      const auth  = await getAuthClient();
      const drive = google.drive({ version: "v3", auth });
    
      log("Uploading file…");
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
        const folderUrl = await uploadToDrive(CONFIG.outputFile);
    
        console.log("\n✅  Done.");
    
      } catch (err) {
        log(`Workflow failed: ${err.message}`, true);
        process.exitCode = 1;
      } finally {
        if (context) await context.close();
      }
    })();