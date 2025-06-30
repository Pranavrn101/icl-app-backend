import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"

const router = express.Router()
const uploadDir = "./uploads"

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

router.post("/", upload.array("images"), (req, res) => {
  const urls = req.files.map((file) => `http://localhost:3001/uploads/${file.filename}`)
  res.json({ urls })
})

export default router
