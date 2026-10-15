const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const { sql, getPool } = require("../db");

async function main() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password || password.length < 8) {
    console.log("Usage: npm run reset-password -- <username> <new password>");
    console.log("Password must be at least 8 characters.");
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const pool = await getPool();
    const result = await pool
      .request()
      .input("username", sql.NVarChar(50), username)
      .input("hash", sql.NVarChar(200), passwordHash)
      .query("UPDATE Admins SET PasswordHash = @hash WHERE Username = @username");

    if (result.rowsAffected[0] === 0) {
      console.log(`No admin named "${username}" found.`);
      process.exit(1);
    }

    console.log(`Password for "${username}" changed ✅`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
