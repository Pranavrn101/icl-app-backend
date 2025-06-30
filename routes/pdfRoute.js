import express from "express";
import pool from "../../Backend/db.js";
// ✅ Correct for ESM — include .js extension
import { generatePdfFromData } from "../../utils/generatedPdf.js";


const router = express.Router();


router.get("/reports/:mawbNumber/pdf", async (req, res) => {
  const { mawbNumber } = req.params;
console.log("Fetching PDF for MAWB:", mawbNumber); // Add this for debugging
  try {
    const jobCardQuery = "SELECT * FROM job_cards WHERE mawb_number = $1";
    const reportQuery = "SELECT * FROM warehouse_reports WHERE mawb_number = $1";

    const [jobCardRes, reportRes] = await Promise.all([
      pool.query(jobCardQuery, [mawbNumber]),
      pool.query(reportQuery, [mawbNumber])
    ]);

    const jobCard = jobCardRes.rows[0];
    const report = reportRes.rows[0];

    if (!jobCard || !report) {
      return res.status(404).json({ error: "Data not found" });
    }

    const pdfBuffer = await generatePdfFromData({ jobCard, report });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Report_${mawbNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
