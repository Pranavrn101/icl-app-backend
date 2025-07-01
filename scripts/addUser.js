// scripts/addUser.js
import bcrypt from "bcrypt";
import pool from "../db.js"; // adjust path if needed

const username = "testuser3";
const plainPassword = "testpassword345";
const role = "office";

async function addUser() {
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(plainPassword, saltRounds);

  try {
    const res = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *",
      [username, password_hash, role]
    );
    console.log("✅ User added:", res.rows[0]);
  } catch (err) {
    console.error("❌ Error adding user:", err);
  } finally {
    pool.end();
  }
}

addUser();
