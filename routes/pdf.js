import express from "express"
import multer from "multer"
import pdf from "pdf-parse"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post("/extract-pdf-data", upload.single("file"), async (req, res) => {
  try {
    const text = (await pdf(req.file.buffer)).text

    const extract = (regex, fallback = "") => {
      const match = text.match(regex)
      if (match) {
        const value = match[1].trim()
        if (/^(MAWB|Importer|Exporter|Origin|Estimated|Actual|Warehouse|Is|No\.|Organic|Shortages|Damages)/i.test(value)) {
          return fallback
        }
        return value
      }
      return fallback
    }

    const extractedData = {
      shipmentNo: extract(/Shipment No:\s*([A-Z0-9-]+)/i),
      consolNo: extract(/Consol No:\s*([A-Z0-9-]+)/i),
      mawbNumber: extract(/MAWB Number:\s*([^\n]+)/i),
      hawbNumber: extract(/HAWB Number:\s*([^\n]+)/i),
      importer: extract(/Importer:\s*([^\n]+)/i),
      exporter: extract(/Exporter:\s*([^\n]+)/i),
      origin: extract(/Origin:\s*([^\n]+)/i),
      eta: extract(/Estimated Date of Arrival:\s*(\d{2}-[A-Za-z]{3}-\d{2})/i),
      numberOfPieces: extract(/No\.of Pces Expected:\s*([^\n]+)/i),
    }

    res.json({ extractedData, rawText: text })
  } catch (err) {
    console.error("❌ PDF extract failed:", err)
    res.status(500).json({ error: "Failed to process PDF" })
  }
})

export default router
