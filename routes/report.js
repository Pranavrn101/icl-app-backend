// Inside routes/report.js (for example)
router.get("/report/:mawb", async (req, res) => {
  const { mawb } = req.params;
   console.log("MAWB requested:", mawb);
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM job_cards jc
       JOIN warehouse_reports wr ON jc.mawb_number = wr.mawb_number
       WHERE jc.mawb_number = $1`,
      [mawb]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Report not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
