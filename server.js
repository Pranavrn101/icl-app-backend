import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pdfRoutes from "./routes/pdf.js";
import jobCardsRoute from "./routes/jobCards.js";
import warehouseReportRoute from "./routes/warehouseReport.js";
import uploadImagesRoute from "./routes/uploadImages.js";
import warehouseStaffRoutes from "./routes/warehouseStaff.js";
import pdfRoute from "./routes/pdfRoute.js";
import imagePdfRoute from "./routes/imagePdfRoute.js";
import sendEmailRoute from "./routes/sendEmailRoute.js";
import loginRoutes from "./routes/login.js";
import pool from "./db.js";
import { authenticateToken } from "./middleware/auth.js";

const app = express();

// ✅ Correct CORS setup
app.use(cors({
  origin: "http://localhost:3003",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.json());

console.log("🚀 server.js is running!!");

// ✅ Route mounts
app.use("/api", pdfRoutes);
app.use("/api/job-cards", jobCardsRoute);
app.use("/api/warehouse-report", warehouseReportRoute);
app.use("/api/upload-images", uploadImagesRoute);
app.use("/uploads", express.static("uploads"));
app.use("/api/warehouse-staff", warehouseStaffRoutes);
app.use("/api", pdfRoute);
app.use("/api", imagePdfRoute);
app.use("/api/report", sendEmailRoute);
// app.use("/api", loginRoutes); ❌ You can remove this if you add login route below

// ✅ Login route
app.post("/api/login", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const userResult = await pool.query("SELECT * FROM users WHERE username = $1 AND role = $2", [username, role]);
    const user = userResult.rows[0];

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username: user.username, role: user.role }, "your_jwt_secret", { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Authenticated example route
app.get("/api/protected-route", authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, you accessed a protected route!` });
});

// ✅ MAWB report route (fixed leading slash)
app.get("/api/report/:mawb", async (req, res) => {
  const { mawb } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM job_cards jc
      JOIN warehouse_reports wr ON jc.mawb_number = wr.mawb_number
      WHERE jc.mawb_number = $1
    `, [mawb]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/healthcheck", (req, res) => {
  res.send("Server is healthy");
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
