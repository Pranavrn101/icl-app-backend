import express from "express"
import nodemailer from "nodemailer"
import { generatePdfFromData } from "../../utils/generatedPdf.js"
import { generateImagesPdf } from "../../utils/generateImagesPdf.js"
import pool from "../db.js"

const router = express.Router()
 const formatDate = (input) => {
  if (!input) return "";
  const date = new Date(input);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

router.post("/send-email/:mawb", async (req, res) => {
  const { mawb } = req.params

  try {
    // Fetch job card and report data
    const { rows } = await pool.query(`
      SELECT * FROM job_cards jc
      JOIN warehouse_reports wr ON jc.mawb_number = wr.mawb_number
      WHERE jc.mawb_number = $1
    `, [mawb])

    if (rows.length === 0) {
      return res.status(404).json({ error: "No data found" })
    }

    const row = rows[0]

    const jobCard = {
       mawb_number: row.mawb_number,
       hawb_number: row.hawb_number,
    created_date: formatDate(row.created_date),
  defra_required: row.defra_required,
  importer: row.importer,
  exporter: row.exporter,
  origin: row.origin,
  eta: formatDate(row.eta),
  number_of_pieces: row.number_of_pieces
    }
let parsedItems = [];

try {
  if (typeof row.items === "string") {
    parsedItems = JSON.parse(row.items);
  } else if (Array.isArray(row.items)) {
    parsedItems = row.items;
  } else if (typeof row.items === "object" && row.items !== null) {
    parsedItems = [row.items];
  }
} catch (err) {
  console.warn("⚠️ Failed to parse row.items:", err.message);
}


 

  const report = {
  arrival_date: formatDate(row.actual_arrival_date),
  warehouse_arrival_time: row.warehouse_arrival_time,
  vehicle_temperature: row.vehicle_temperature,
  trailer_clean: row.trailer_clean,
  free_from_pests: row.free_from_pests,
  organic_goods: row.organic_goods,
  pallet_count: row.pallet_count,
  piece_count: row.piece_count,
  items: parsedItems,
  shortages: row.shortages,
  damages: row.damages,
  staff_name: row.warehouse_staff,
  signature: row.signature
};

    const pdf1 = await generatePdfFromData({ jobCard, report })





let imageUrls = []

try {
  const raw = row.image_url

  if (typeof raw === "string") {
    console.log("📦 Raw image_url string from DB:", raw)

    // Only try parsing if it starts and ends with brackets (i.e., array-like)
    if (raw.trim().startsWith("[") && raw.trim().endsWith("]")) {
      imageUrls = JSON.parse(raw)
    } else {
      console.warn("⚠️ image_url is a string but not a JSON array format")
    }
  } else if (Array.isArray(raw)) {
    imageUrls = raw
  } else if (typeof raw === "object" && raw !== null) {
    imageUrls = Object.values(raw)
  }
} catch (error) {
  console.warn("⚠️ Failed to parse image_url:", error.message)
  imageUrls = []
}




   console.log("🧪 Debug Image URL from DB:", row.image_url);

const pdf2 = await generateImagesPdf(row.mawb_number, imageUrls);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pranavrn6080@gmail.com",
        pass: "zgeuamjzdbtqgigt" // ⚠️ Replace this with an App Password for security
      }
    })

    // ✉️ 1. Send report PDF to report@example.com
    await transporter.sendMail({
      from: '"Warehouse Reports" <pranavrn6080@gmail.com>',
      to: "pranavrnair101@gmail.com", // ✅ set your report email here
      subject: `Warehouse Report for MAWB ${mawb}`,
      text: "Attached is the filled warehouse report.",
      attachments: [
        {
          filename: `Report_${mawb}.pdf`,
          content: pdf1
        }
      ]
    })

    // ✉️ 2. Send images PDF to photos@example.com
    await transporter.sendMail({
      from: '"Warehouse Photos" <pranavrn6080@gmail.com>',
      to: "pranavrnair101@gmail.com", // ✅ set your images email here
      subject: `Images for MAWB ${mawb}`,
      text: "Attached are the warehouse intake images.",
      attachments: [
        {
          filename: `Images_${mawb}.pdf`,
          content: pdf2
        }
      ]
    })

    console.log("✅ Both emails sent successfully.")
    res.status(200).json({ success: true, message: "Both emails sent" })
  } catch (err) {
    console.error("❌ Failed to send email:", err)
    res.status(500).json({ error: "Email send failed" })
  }
})

export default router
