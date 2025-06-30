// hash-password.js (ES module version)
import bcrypt from "bcrypt";

bcrypt.hash("yourpassword", 10).then(hash => {
  console.log("Hashed password:", hash);
});
