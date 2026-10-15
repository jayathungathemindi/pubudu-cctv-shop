const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const { sql, getPool } = require("../db");

async function main() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password || password.length < 8) {
    console.log("Usage: npm run create-admin -- <username> <password>");
    console.log("Password එක අවම අකුරු 8ක් වෙන්න ඕන.");
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const pool = await getPool();
    await pool
      .request()
      .input("username", sql.NVarChar(50), username)
      .input("hash", sql.NVarChar(200), passwordHash)
      .query(
        "INSERT INTO Admins (Username, PasswordHash) VALUES (@username, @hash)",
      );

    console.log(`Admin "${username}" already ✅`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
