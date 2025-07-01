import bcrypt from "bcrypt";
import pool from "./db.js"; // your PostgreSQL connection

async function addUser(username, plainPassword, role) {
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(plainPassword, saltRounds);

  try {
    await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
      [username, password_hash, role]
    );
    console.log(`User ${username} added successfully!`);
  } catch (error) {
    console.error("Error adding user:", error);
  } finally {
    pool.end();
  }
}
// Replace these with your test user values:
addUser("ware1", "ware123", "warehouse");