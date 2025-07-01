import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateImagesPdf(mawb, images) {
  try {
    const templatePath = path.join(__dirname, "..", "templates", "image-report.ejs");

    // ✅ Safely ensure `images` is an array
    let safeImages = [];
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) safeImages = parsed;
      } catch {
        safeImages = [];
      }
    } else if (Array.isArray(images)) {
      safeImages = images;
    }

    // ✅ Render HTML using EJS
    const html = await ejs.renderFile(templatePath, {
      mawb,
      images: safeImages
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "40px",
        bottom: "40px",
        left: "30px",
        right: "30px"
      }
    });

    await browser.close();
    return pdfBuffer;
  } catch (err) {
    console.error("❌ Failed to generate image PDF:", err);
    throw err;
  }
}
