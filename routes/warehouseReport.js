import express from "express"
import  pool  from "../db.js"

const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const {
      mawbNumber,
      actualArrivalDate,
      warehouseArrivalTime,
      vehicleTemperature,
      trailerClean,
      freeFromPests,
      organicGoods,
      palletCount,
      pieceCount,
      items,
      shortages,
      damages,
      imageUrls,
      warehouseStaff,
      signature,
    } = req.body
 // ✅ Add this log to debug if signature is being received
    console.log("📌 Signature Preview:", signature?.substring(0, 100));
    // Insert report into the warehouse_reports table
    const result = await pool.query(
      `INSERT INTO warehouse_reports (
        mawb_number,
        actual_arrival_date,
        warehouse_arrival_time,
        vehicle_temperature,
        trailer_clean,
        free_from_pests,
        organic_goods,
        pallet_count,
        piece_count,
        items,
        shortages,
        damages,
        image_url,
        warehouse_staff,
        signature
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        mawbNumber,
        actualArrivalDate,
        warehouseArrivalTime,
        vehicleTemperature,
        trailerClean,
        freeFromPests,
        organicGoods,
        palletCount,
        pieceCount,
        JSON.stringify(items),
        shortages,
        damages,
        JSON.stringify(imageUrls),
        warehouseStaff,
        signature,
      ]
    )
    res.status(201).json({ success: true, message: "Report saved" })
  } catch (error) {
    console.error("Failed to save report:", error)
    res.status(500).json({ success: false, error: "Server error" })
  }
})

export default router
