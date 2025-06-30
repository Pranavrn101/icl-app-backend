import express from "express";
import pool from "../db.js";
import { generateImagesPdf } from "../../utils/generateImagesPdf.js";

const router = express.Router();

router.get("/report/images-pdf/:mawb", async (req, res) => {
  const { mawb } = req.params;

  try {
    // Fetch the image URLs from DB
    const result = await pool.query(
      `SELECT image_url FROM warehouse_reports WHERE mawb_number = $1`,
      [mawb]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No report found for given MAWB" });
    }

    const imageUrls = result.rows[0].image_url;

    // Generate the PDF
    const pdfBuffer = await generateImagesPdf(mawb, imageUrls);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Images_${mawb}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ Failed to generate image PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
