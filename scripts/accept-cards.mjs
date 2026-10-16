// Acceptance run for the card builder, through the screen, in headless Chrome (puppeteer-core ships with lighthouse).
//
//   1. Start a FRESH dev server with Supabase switched off, so the app uses its in-memory store and the demo card
//      (KP-2010-DEMO, creator code TAO-2010, viewer PIN 2010) and nothing in the real database is touched:
//        NEXT_PUBLIC_SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= NEXT_PUBLIC_SUPABASE_ANON_KEY= npx next dev -p 5002
//   2. node scripts/accept-cards.mjs          (env: BASE, CHROME_PATH)
//
// The server must be fresh: the first part expects a card that has never been saved.
// Not covered: a real voice recording (needs Supabase Storage) and a card saved before `blocks` existed (see normalize.test.ts).
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(path.join(process.cwd(), "package.json"));
const puppeteer = require("puppeteer-core");
const BASE = process.env.BASE ?? "http://localhost:5002";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log((ok ? "PASS " : "FAIL ") + name + (detail ? "  -> " + detail : "")); };

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-sandbox"],
  userDataDir: fs.mkdtempSync(path.join(os.tmpdir(), "kp-acc-")),
});

async function newPage(viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.errors = errors;
  return page;
}

const click = (page, text) => page.evaluate((t) => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes(t)); if (!b) return false; b.click(); return true; }, text);
const tick = (page, label) => page.evaluate((l) => { const b = [...document.querySelectorAll("[role=checkbox]")].find((x) => x.textContent.includes(l)); b?.click(); return !!b; }, label);
const setVal = (page, id, v) => page.evaluate((id, v) => { const el = document.getElementById(id); if (!el) return false; const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true })); return true; }, id, v);
// Every message on screen (the bar at the bottom and any toast that has not faded yet).
const alertText = (page) => page.evaluate(() => [...document.querySelectorAll("[role=alert]")].map((e) => e.textContent.trim()).join(" | "));
const blockOrder = (page) => page.evaluate(() => [...document.querySelectorAll('[id^="block-"]')].map((e) => e.id.replace("block-", "")));

async function login(page, mode = "create", code = "TAO-2010") {
  await page.goto(BASE + "/gift", { waitUntil: "domcontentloaded", timeout: 60000 });
  return page.evaluate(async (mode, code) => (await fetch("/api/gifts/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: "KP-2010-DEMO", passcode: code, mode }) })).status, mode, code);
}

// ---------------------------------------------------------------- criteria 1, 2, 3 (studio, through the screen)
{
  const page = await newPage({ width: 1280, height: 900 });
  check("login to the studio", (await login(page)) === 200);
  await page.goto(BASE + "/create/KP-2010-DEMO", { waitUntil: "networkidle2" });
  await page.waitForSelector("[role=checkbox]");

  const ticked0 = await page.evaluate(() => document.querySelectorAll('[role=checkbox][aria-checked="true"]').length);
  check("1. a new card starts with nothing ticked", ticked0 === 0, `${ticked0} ticked`);

  await click(page, "Tiếp tục"); await wait(300);
  check("3. next with nothing ticked is refused with a message", /ít nhất một thông điệp/.test(await alertText(page)), await alertText(page));

  await tick(page, "Thư tay"); await tick(page, "Video"); await wait(200);
  await click(page, "Tiếp tục"); await wait(500);
  check("1. after confirming, each ticked message has its section", JSON.stringify(await blockOrder(page)) === JSON.stringify(["letter", "video"]), JSON.stringify(await blockOrder(page)));

  await click(page, "Tiếp tục"); await wait(300);
  check("3. next without a recipient name is refused", /tên người nhận/.test(await alertText(page)), await alertText(page));

  await setVal(page, "names-recipient", "Lan");
  await click(page, "Tiếp tục"); await wait(300);
  check("3. an empty letter is refused with its name", /đang trống|viết lời nhắn/.test(await alertText(page)), await alertText(page));

  await setVal(page, "letter-content", "Chúc mừng 20/10!");
  await click(page, "Tiếp tục"); await wait(300);
  check("3. an empty ticked Video is refused with its name", /Video đang trống/.test(await alertText(page)), await alertText(page));

  await setVal(page, "video-url", "https://youtu.be/dQw4w9WgXcQ"); await wait(200);
  await page.evaluate(() => document.querySelector('button[aria-label="Bỏ mục Video khỏi thiệp"]')?.click()); await wait(300);
  check("1. unticking hides the section", JSON.stringify(await blockOrder(page)) === JSON.stringify(["letter"]), JSON.stringify(await blockOrder(page)));
  await click(page, "Quay lại"); await wait(300);
  const stillUnticked = await page.evaluate(() => [...document.querySelectorAll("[role=checkbox]")].find((b) => b.textContent.includes("Video"))?.getAttribute("aria-checked"));
  await tick(page, "Video"); await click(page, "Tiếp tục"); await wait(500);
  const kept = await page.evaluate(() => document.getElementById("video-url")?.value);
  check("1. unticked content is not lost when ticked again", stillUnticked === "false" && kept === "https://youtu.be/dQw4w9WgXcQ", `unticked=${stillUnticked}, kept=${kept}`);

  await page.evaluate(() => document.querySelector('button[aria-label="Chuyển mục Video lên trên"]')?.click()); await wait(300);
  check("2. Up moves a message above the other", JSON.stringify(await blockOrder(page)) === JSON.stringify(["video", "letter"]), JSON.stringify(await blockOrder(page)));

  await click(page, "Tiếp tục"); await wait(500);
  await click(page, "Lưu thiệp");
  await page.waitForFunction(() => location.pathname.startsWith("/g/"), { timeout: 20000 }).catch(() => null);
  check("saving works and goes to the card page", page.url().includes("/g/KP-2010-DEMO"), page.url());

  await page.goto(BASE + "/create/KP-2010-DEMO", { waitUntil: "networkidle2" });
  await page.waitForSelector("[role=checkbox]");
  const ticked = await page.evaluate(() => [...document.querySelectorAll('[role=checkbox][aria-checked="true"]')].map((b) => b.querySelector(".font-bold")?.textContent));
  await click(page, "Tiếp tục"); await wait(500);
  check("2. after saving and reopening, the order is kept", JSON.stringify(await blockOrder(page)) === JSON.stringify(["video", "letter"]), `${JSON.stringify(await blockOrder(page))} ticked=${JSON.stringify(ticked)}`);
  check("studio: no script errors", page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await page.close();
}

// ---------------------------------------------------------------- criteria 4 and 5 (the card as the recipient sees it)
const SAMPLE_WORDS = ["Bảo Ngọc", "Phan Mạnh Quỳnh", "Có Chàng Trai", "unsplash", "mixkit", "Ocean Star", "Người bạn đặc biệt"];
const TEMPLATES = ["storybook-sunset", "vintage-scrapbook", "retro-nostalgia"];
const DEVICES = [
  { name: "phone", viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, layout: "portrait" },
  { name: "ipad-upright", viewport: { width: 820, height: 1180, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, layout: "portrait" },
  { name: "ipad-sideways", viewport: { width: 1180, height: 820, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, layout: "landscape" },
  { name: "desktop", viewport: { width: 1440, height: 900, deviceScaleFactor: 1 }, layout: "landscape" },
];
const BLOCKS = ["letter", "photos", "video", "music", "anniversary", "timeline", "finalMessage"];
const EXPECTED_PAGES = ["Mở quà", "Thư tay", "Ảnh", "Video", "Nhạc", "Ngày kỷ niệm", "Mốc thời gian", "Lời cảm ơn"];

for (const template of TEMPLATES) {
  // save a card with everything (photos drawn in the page)
  const setup = await newPage({ width: 1000, height: 800 });
  await login(setup);
  const saved = await setup.evaluate(async (blocks, template) => {
    const pic = (a, b) => { const c = document.createElement("canvas"); c.width = 400; c.height = 300; const x = c.getContext("2d"); const g = x.createLinearGradient(0, 0, 400, 300); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, 400, 300); return c.toDataURL("image/jpeg", 0.7); };
    const res = await fetch("/api/gifts/KP-2010-DEMO/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ giftData: {
      template, blocks, recipientName: "Lan", senderName: "Hoàng Nam",
      letterContent: "Chúc mừng 20/10!", memoryPhotos: [{ url: pic("#f59e0b", "#ef4444"), caption: "Chiều đi dạo" }, { url: pic("#0ea5e9", "#6366f1"), caption: "Biển" }],
      videoUrl: "https://youtu.be/dQw4w9WgXcQ", song: { source: "preset", presetId: "piano" },
      anniversary: { date: "2024-02-14", label: "Ngày yêu" }, timeline: [{ date: "2024-02-14", title: "Gặp nhau", text: "" }],
      finalMessage: "Món quà này sẽ luôn ở đây.",
    } }) });
    return res.status;
  }, BLOCKS, template);
  await setup.close();
  check(`[${template}] the card saves`, saved === 200, `status ${saved}`);

  // A visitor who has not proved the code yet (a scan of the QR) is asked for the 4-digit OTP, then sees the card at once.
  if (template === TEMPLATES[0]) {
    const gate = await newPage({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await gate.goto(BASE + "/g/KP-2010-DEMO", { waitUntil: "domcontentloaded" });
    const asked = await gate.waitForSelector("#gift-pin", { timeout: 15000 }).then(() => true).catch(() => false);
    const heldBack = await gate.evaluate(() => !document.querySelector("[data-layout]") && !document.querySelector('button[aria-label="Nhấn giữ để hiện trái tim"]'));
    check("QR without a session: asks for the OTP, shows no card and no heart to hold", asked && heldBack);
    await gate.type("#gift-pin", "9999");
    await gate.click('button[type="submit"]');
    await wait(1200);
    check("a wrong OTP is refused with a message", /OTP|mã|đúng|sai/i.test(await alertText(gate)), await alertText(gate));
    await gate.click("#gift-pin", { clickCount: 3 });
    await gate.type("#gift-pin", "2010");
    await gate.click('button[type="submit"]');
    const shown = await gate.waitForSelector("[data-layout]", { timeout: 15000 }).then(() => true).catch(() => false);
    check("the right OTP shows the card at once", shown);
    const toggle = await gate.evaluate(() => !!document.querySelector('button[aria-label="Bật nhạc nền"], button[aria-label="Tắt nhạc nền"]'));
    check("a card with a built-in melody has a music button", toggle);
    await gate.close();
  }

  for (const dev of DEVICES) {
    const page = await newPage(dev.viewport);
    await login(page, "open", "2010");
    await page.goto(BASE + "/g/KP-2010-DEMO", { waitUntil: "domcontentloaded" });
    const opened = await page.waitForSelector("[data-layout]", { timeout: 15000 }).then(() => true).catch(() => false);
    if (!opened) { check(`[${template}/${dev.name}] the card shows straight away`, false, await page.evaluate(() => document.body.innerText.slice(0, 120))); await page.close(); continue; }
    await wait(500);

    const layout = await page.evaluate(() => document.querySelector("[data-layout]").getAttribute("data-layout"));
    check(`[${template}/${dev.name}] frame is ${dev.layout}`, layout === dev.layout, layout);

    const labels = await page.evaluate(() => [...document.querySelectorAll('nav[aria-label="Các trang của thiệp"] button')].map((b) => b.getAttribute("aria-label").replace(/^Trang \d+: /, "")));
    check(`[${template}/${dev.name}] pages = ticked messages in order`, JSON.stringify(labels) === JSON.stringify(EXPECTED_PAGES), JSON.stringify(labels));

    let leaked = [];
    let overflow = false;
    let videoFrame = "";
    let musicToggle = "";
    for (let i = 0; i < labels.length; i++) {
      const info = await page.evaluate(() => ({
        text: document.querySelector("main")?.innerText ?? "",
        html: document.querySelector("main")?.innerHTML ?? "",
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        frame: document.querySelector("main iframe")?.getAttribute("src") ?? "",
      }));
      for (const w of SAMPLE_WORDS) if (info.text.includes(w) || info.html.includes(w)) leaked.push(`${w}@${labels[i]}`);
      if (info.overflow) overflow = true;
      if (labels[i] === "Video") videoFrame = info.frame;
      if (labels[i] === "Nhạc") {
        musicToggle = await page.evaluate(async () => {
          const b = [...document.querySelectorAll("main button")].find((x) => /nhạc/i.test(x.getAttribute("aria-label") || ""));
          if (!b) return "no button";
          const before = b.getAttribute("aria-pressed");
          // the melody already started when the card opened; pressing toggles it
          b.click();
          await new Promise((r) => setTimeout(r, 300));
          return `${before}->${b.getAttribute("aria-pressed")}`;
        });
      }
      await page.evaluate(() => document.querySelector('button[aria-label="Trang sau"]')?.click());
      await wait(250);
    }
    check(`[${template}/${dev.name}] no sample content anywhere`, leaked.length === 0, leaked.join(", "));
    check(`[${template}/${dev.name}] no horizontal scrolling`, !overflow);
    check(`[${template}/${dev.name}] the video plays in a privacy-enhanced frame`, videoFrame.startsWith("https://www.youtube-nocookie.com/embed/"), videoFrame);
    check(`[${template}/${dev.name}] the built-in melody can be toggled`, /^(true->false|false->true)$/.test(musicToggle), musicToggle);
    check(`[${template}/${dev.name}] no script errors`, page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
    await page.close();
  }
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) { console.log("FAILED:"); for (const f of failed) console.log(" - " + f.name + (f.detail ? "  -> " + f.detail : "")); }
