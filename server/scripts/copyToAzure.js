// Copies the shop database from this computer to Azure SQL (run once, before going online).
// Usage: npm run copy-to-azure
// Needs AZURE_DB_SERVER, AZURE_DB_DATABASE, AZURE_DB_USER, AZURE_DB_PASSWORD in server/.env
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const sql = require("mssql");
const { dbConfig } = require("../db");

const azureConfig = {
  user: process.env.AZURE_DB_USER,
  password: process.env.AZURE_DB_PASSWORD,
  server: process.env.AZURE_DB_SERVER,
  database: process.env.AZURE_DB_DATABASE,
  connectionTimeout: 60000,
  options: { encrypt: true, trustServerCertificate: false },
};

// Same tables as the local database
const CREATE_TABLES = `
IF OBJECT_ID('Products') IS NULL
  CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    Image NVARCHAR(255) NULL,
    Category NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    SubCategory NVARCHAR(100) NULL
  );

IF OBJECT_ID('Admins') IS NULL
  CREATE TABLE Admins (
    AdminId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(200) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    LastLoginAt DATETIME2 NULL
  );

IF OBJECT_ID('ProductSpecs') IS NULL
BEGIN
  CREATE TABLE ProductSpecs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL REFERENCES Products(Id) ON DELETE CASCADE,
    Label NVARCHAR(100) NOT NULL,
    Value NVARCHAR(1000) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0
  );
  CREATE INDEX IX_ProductSpecs_ProductId ON ProductSpecs(ProductId);
END

IF OBJECT_ID('ProductImages') IS NULL
BEGIN
  CREATE TABLE ProductImages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL REFERENCES Products(Id) ON DELETE CASCADE,
    Url NVARCHAR(255) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0
  );
  CREATE INDEX IX_ProductImages_ProductId ON ProductImages(ProductId);
END
`;

// Table → its columns (the first one is the IDENTITY id). Products first, because the others point to it.
const TABLES = {
  Products: ["Id", "Name", "Price", "Stock", "Image", "Category", "Description", "SubCategory"],
  Admins: ["AdminId", "Username", "PasswordHash", "CreatedAt", "LastLoginAt"],
  ProductSpecs: ["Id", "ProductId", "Label", "Value", "SortOrder"],
  ProductImages: ["Id", "ProductId", "Url", "SortOrder"],
};

// Old uploads were saved as "http://localhost:5000/uploads/x.jpg" - online they are "/uploads/x.jpg"
function fixImageUrl(value) {
  return typeof value === "string"
    ? value.replace(/^https?:\/\/localhost:\d+\/uploads\//, "/uploads/")
    : value;
}

async function main() {
  const missing = ["AZURE_DB_SERVER", "AZURE_DB_DATABASE", "AZURE_DB_USER", "AZURE_DB_PASSWORD"].filter(
    (name) => !process.env[name],
  );
  if (missing.length > 0) {
    console.log(`Please add these to server/.env first: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log("Connecting to the local database...");
  const local = await new sql.ConnectionPool(dbConfig()).connect();
  console.log("Connecting to Azure SQL (it may take a minute to wake up)...");
  const azure = await new sql.ConnectionPool(azureConfig).connect();

  await azure.request().batch(CREATE_TABLES);
  console.log("Tables are ready on Azure.");

  const existing = await azure.request().query("SELECT COUNT(*) AS n FROM Products");
  if (existing.recordset[0].n > 0) {
    console.log("Azure already has products - stopping so nothing is copied twice.");
    process.exit(1);
  }

  const transaction = new sql.Transaction(azure);
  await transaction.begin();
  try {
    for (const [table, columns] of Object.entries(TABLES)) {
      const rows = (await local.request().query(`SELECT ${columns.join(", ")} FROM ${table}`)).recordset;

      // Keep the same ids, so product links and images still match
      let insert = `SET IDENTITY_INSERT ${table} ON;`;
      for (const row of rows) {
        const request = new sql.Request(transaction);
        columns.forEach((col, i) => {
          const value = col === "Image" || col === "Url" ? fixImageUrl(row[col]) : row[col];
          request.input(`p${i}`, value);
        });
        await request.query(
          `${insert} INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map((_, i) => `@p${i}`).join(", ")});`,
        );
        insert = "";
      }
      if (rows.length > 0) await new sql.Request(transaction).query(`SET IDENTITY_INSERT ${table} OFF;`);
      console.log(`  ${table}: ${rows.length} rows copied`);
    }
    await transaction.commit();
  } catch (err) {
    await transaction.rollback().catch(() => {});
    throw err;
  }

  console.log("✅ Done! Your shop data is now on Azure.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
