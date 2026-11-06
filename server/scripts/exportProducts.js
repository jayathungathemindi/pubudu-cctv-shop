// Copies all products from the local database into the public website.
// Run it after changing products in the admin page, then git push.
// Usage: npm run export-products
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { getPool } = require("../db");

const PUBLIC_DIR = path.join(__dirname, "..", "..", "electric-shop", "public");
const DATA_FILE = path.join(PUBLIC_DIR, "data", "products.json");
const PUBLIC_UPLOADS = path.join(PUBLIC_DIR, "uploads");
// Where the admin page saves uploaded photos
const UPLOAD_DIRS = [
  process.env.UPLOAD_DIR,
  path.join(__dirname, "..", "uploads"),
].filter(Boolean);

// Old uploads were saved as "http://localhost:5000/uploads/x.jpg" - the website uses "/uploads/x.jpg"
function fixImageUrl(url) {
  return url ? url.replace(/^https?:\/\/localhost:\d+\/uploads\//, "/uploads/") : url;
}

async function main() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT Id AS id, Name AS name, Price AS price, Stock AS stock,
           Image AS image, Category AS category, SubCategory AS subCategory,
           Description AS description
    FROM Products ORDER BY Id;

    SELECT ProductId AS productId, Label AS label, Value AS value
    FROM ProductSpecs ORDER BY ProductId, SortOrder, Id;

    SELECT ProductId AS productId, Url AS url
    FROM ProductImages ORDER BY ProductId, SortOrder, Id;
  `);
  const [rows, specRows, imageRows] = result.recordsets;

  // Same shape as the server's /api/products/:id answer
  const products = rows.map((product) => {
    const images = imageRows
      .filter((img) => img.productId === product.id)
      .map((img) => fixImageUrl(img.url));
    return {
      ...product,
      image: fixImageUrl(product.image),
      specs: specRows
        .filter((s) => s.productId === product.id)
        .map(({ label, value }) => ({ label, value })),
      // Older products may only have the single Image column filled
      images: images.length > 0 ? images : product.image ? [fixImageUrl(product.image)] : [],
    };
  });

  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));

  // Copy the uploaded photos the products use, and remove ones no product uses any more
  const used = new Set(
    products
      .flatMap((p) => [p.image, ...p.images])
      .filter((url) => url?.startsWith("/uploads/"))
      .map((url) => url.slice("/uploads/".length)),
  );
  fs.mkdirSync(PUBLIC_UPLOADS, { recursive: true });
  for (const file of fs.readdirSync(PUBLIC_UPLOADS)) {
    if (!used.has(file)) fs.rmSync(path.join(PUBLIC_UPLOADS, file));
  }
  const missing = [];
  for (const file of used) {
    const source = UPLOAD_DIRS.map((dir) => path.join(dir, file)).find((f) => fs.existsSync(f));
    if (source) fs.copyFileSync(source, path.join(PUBLIC_UPLOADS, file));
    else missing.push(file);
  }

  console.log(`✅ ${products.length} products saved to electric-shop/public/data/products.json`);
  console.log(`✅ ${used.size - missing.length} uploaded photos copied to electric-shop/public/uploads`);
  if (missing.length > 0) {
    console.log(`⚠️  These photos were not found, upload them again in admin: ${missing.join(", ")}`);
  }
  console.log('\nNow put it online:\n  git add .\n  git commit -m "Update products"\n  git push');
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
