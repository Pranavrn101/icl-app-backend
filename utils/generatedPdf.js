import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function generatePdfFromData({ jobCard, report }) {
  const templatePath = path.join(__dirname, "..", "templates", "report.ejs");

  const html = await ejs.renderFile(templatePath, { jobCard, report });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "40px",
      bottom: "40px",
      left: "30px",
      right: "30px",
    },
  });

  await browser.close();
  return pdfBuffer;
}
