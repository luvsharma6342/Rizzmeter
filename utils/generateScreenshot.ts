// utils/generateScreenshot.ts
import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";
import path from "path";
import fs from "fs";

/**
 * Generate a PNG screenshot for a given report ID and store it in the public folder.
 * Returns the public URL path to the screenshot (e.g., /share_screenshots/<file>.png).
 */
export async function generateScoreScreenshot(reportId: string): Promise<string> {
  // Resolve the URL of the report page. Adjust base URL as needed for production.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const reportUrl = `${baseUrl}/report/${reportId}`;

  // Launch headless Chromium.
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(reportUrl, { waitUntil: "networkidle2" });
  // Give the page a moment to fully render any dynamic elements.
  await page.waitForTimeout(1000);

  const screenshotBuffer = await page.screenshot({ type: "png", fullPage: true });
  await browser.close();

  // Ensure the public folder exists.
  const publicDir = path.resolve(process.cwd(), "public");
  const screenshotsDir = path.join(publicDir, "share_screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const filename = `${uuidv4()}.png`;
  const filePath = path.join(screenshotsDir, filename);
  fs.writeFileSync(filePath, screenshotBuffer);

  // Return the public URL path.
  return `/share_screenshots/${filename}`;
}
