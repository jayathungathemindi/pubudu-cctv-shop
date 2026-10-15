const sql = require("mssql");

let poolPromise = null;

// Returns a connected pool. If connecting fails, or the connection breaks
// later (e.g. SQL Server restarts), the next call tries to connect again.
function getPool() {
  if (!poolPromise) {
    const pool = new sql.ConnectionPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      options: {
        instanceName: process.env.DB_INSTANCE || undefined,
        encrypt: false,
        trustServerCertificate: true,
      },
    });

    pool.on("error", (err) => {
      console.error("Database connection error:", err.message);
      poolPromise = null;
    });

    poolPromise = pool.connect().catch((err) => {
      console.error("Could not connect to database:", err.message);
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
