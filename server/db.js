const sql = require("mssql");

let poolPromise = null;

// DB_ENCRYPT=true is needed for Azure SQL. The local SQL Server runs without it.
function dbConfig() {
  const encrypt = process.env.DB_ENCRYPT === "true";
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    // A sleeping Azure SQL free database can take up to a minute to wake up
    connectionTimeout: 60000,
    options: {
      instanceName: process.env.DB_INSTANCE || undefined,
      encrypt,
      trustServerCertificate: !encrypt,
    },
  };
}

// Azure SQL answers "not currently available" while the database wakes up
function isWakingUp(err) {
  return /not currently available|40613/i.test(err.message);
}

async function connect() {
  for (let attempt = 1; ; attempt++) {
    const pool = new sql.ConnectionPool(dbConfig());
    pool.on("error", (err) => {
      console.error("Database connection error:", err.message);
      poolPromise = null;
    });

    try {
      return await pool.connect();
    } catch (err) {
      if (attempt >= 6 || !isWakingUp(err)) throw err;
      console.log("Database is waking up, trying again in 10 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
}

// Returns a connected pool. If connecting fails, or the connection breaks
// later (e.g. SQL Server restarts), the next call tries to connect again.
function getPool() {
  if (!poolPromise) {
    poolPromise = connect().catch((err) => {
      console.error("Could not connect to database:", err.message);
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

module.exports = { sql, getPool, dbConfig };
