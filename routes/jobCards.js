import express from "express"
import pool from "../db.js" // or from "./db.js" depending on your path

const router = express.Router()

// 🚀 GET job cards
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM job_cards ORDER BY created_date DESC")
    res.json(result.rows)
  } catch (err) {
    console.error("❌ Error fetching job cards:", err.message)
    res.status(500).json({ error: "Failed to fetch job cards" })
  }
})

router.post("/", async (req, res) => {
  try {
    const {
      shipmentNo,
      consolNo,
      mawbNumber,
      hawbNumber,
      importer,
      exporter,
      origin,
      eta,
      numberOfPieces,
      createdDate,
      defraRequired,
      attachmentUrl,
    } = req.body

    await pool.query(
      `INSERT INTO job_cards (
        consol_no,
        shipment_no,
        mawb_number,
        hawb_number,
        importer,
        exporter,
        origin,
        eta,
        number_of_pieces,
        created_date,
        defra_required,
        attachment_url,
        status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Unattended')`,
      [
        consolNo,
        shipmentNo,
        mawbNumber,
        hawbNumber,
        importer,
        exporter,
        origin,
        eta,
        numberOfPieces,
        createdDate,
        defraRequired,
        attachmentUrl,
      ]
    )

    res.status(201).json({ success: true })
  } catch (err) {
    console.error("❌ Failed to insert job card:", err.message)
    res.status(500).json({ error: "Failed to insert job card", details: err.message })
  }
})
export default router
