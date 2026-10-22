const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { sql, getPool } = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const requireAdmin = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT Id AS id, Name AS name, Price AS price,
             Stock AS stock, Image AS image, Category AS category,
             SubCategory AS subCategory
      FROM Products
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Get one product with its description and specifications
app.get("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request().input("id", sql.Int, id).query(`
      SELECT Id AS id, Name AS name, Price AS price, Stock AS stock,
             Image AS image, Category AS category, SubCategory AS subCategory,
             Description AS description
      FROM Products WHERE Id = @id;

      SELECT Label AS label, Value AS value
      FROM ProductSpecs WHERE ProductId = @id
      ORDER BY SortOrder, Id;

      SELECT Url AS url
      FROM ProductImages WHERE ProductId = @id
      ORDER BY SortOrder, Id;
    `);

    const product = result.recordsets[0][0];
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.specs = result.recordsets[1];
    product.images = result.recordsets[2].map((row) => row.url);
    // Older products may only have the single Image column filled
    if (product.images.length === 0 && product.image) {
      product.images = [product.image];
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Category → its sub-categories (empty list = no sub-categories)
const categories = {
  "TV & Home Audio": [],
  "CCTV & Security": [],
  "Kitchen Appliances": [
    "Rice Cooker",
    "Multi Cooker",
    "Toaster",
    "Air Fryer",
    "Blender",
    "Kettle",
  ],
  "Hardware & Electrical": [],
  "Lighting Products": [],
  "Vehicle Accessories": [],
  "Home & Décor": [],
};

// Keeps only filled spec rows: [{ label, value }]
function cleanSpecs(specs) {
  if (!Array.isArray(specs)) return [];
  return specs
    .map((s) => ({
      label: String(s?.label ?? "").trim(),
      value: String(s?.value ?? "").trim(),
    }))
    .filter((s) => s.label && s.value)
    .slice(0, 50);
}

// Replaces all specs of a product (inside a transaction)
async function saveSpecs(transaction, productId, specs) {
  await new sql.Request(transaction)
    .input("id", sql.Int, productId)
    .query("DELETE FROM ProductSpecs WHERE ProductId = @id");

  for (let i = 0; i < specs.length; i++) {
    await new sql.Request(transaction)
      .input("id", sql.Int, productId)
      .input("label", sql.NVarChar(100), specs[i].label.slice(0, 100))
      .input("value", sql.NVarChar(1000), specs[i].value.slice(0, 1000))
      .input("order", sql.Int, i).query(`
        INSERT INTO ProductSpecs (ProductId, Label, Value, SortOrder)
        VALUES (@id, @label, @value, @order)
      `);
  }
}

const MAX_IMAGES = 5;

// Keeps only filled image paths: ["/images/a.jpg", ...]. The first one is the main image.
// Older clients send a single "image" instead of an "images" list.
function cleanImages({ images, image }) {
  const list = Array.isArray(images) ? images : [image];
  return list
    .map((url) => String(url ?? "").trim().slice(0, 255))
    .filter(Boolean)
    .slice(0, MAX_IMAGES);
}

// Replaces all images of a product (inside a transaction)
async function saveImages(transaction, productId, images) {
  await new sql.Request(transaction)
    .input("id", sql.Int, productId)
    .query("DELETE FROM ProductImages WHERE ProductId = @id");

  for (let i = 0; i < images.length; i++) {
    await new sql.Request(transaction)
      .input("id", sql.Int, productId)
      .input("url", sql.NVarChar(255), images[i])
      .input("order", sql.Int, i).query(`
        INSERT INTO ProductImages (ProductId, Url, SortOrder)
        VALUES (@id, @url, @order)
      `);
  }
}

// Checks product data - returns an error message, or null if OK
function validateProduct({ name, price, stock, category, subCategory }) {
  if (!name || !name.trim()) return "Product name is required";
  if (isNaN(price) || Number(price) <= 0) return "Price must be more than 0";
  if (isNaN(stock) || Number(stock) < 0) return "Stock cannot be negative";
  if (!Object.hasOwn(categories, category)) return "Please choose a valid category";
  // Sub-category is optional, but must belong to the chosen category
  if (subCategory && !categories[category].includes(subCategory))
    return "Please choose a valid sub-category";
  return null;
}

// Add a new product (admin only)
app.post("/api/products", requireAdmin, async (req, res) => {
  const { name, price, stock, category, subCategory, description } = req.body;

  const invalid = validateProduct(req.body);
  if (invalid) {
    return res.status(400).json({ message: invalid });
  }

  const specs = cleanSpecs(req.body.specs);
  const images = cleanImages(req.body);
  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const result = await new sql.Request(transaction)
      .input("name", sql.NVarChar(150), name.trim())
      .input("price", sql.Decimal(10, 2), Number(price))
      .input("stock", sql.Int, Number(stock))
      .input("image", sql.NVarChar(255), images[0] || null)
      .input("category", sql.NVarChar(100), category)
      .input("subCategory", sql.NVarChar(100), subCategory || null)
      .input("description", sql.NVarChar(sql.MAX), description?.trim() || null)
      .query(`
        INSERT INTO Products (Name, Price, Stock, Image, Category, SubCategory, Description)
        OUTPUT INSERTED.Id AS id, INSERTED.Name AS name, INSERTED.Price AS price,
               INSERTED.Stock AS stock, INSERTED.Image AS image,
               INSERTED.Category AS category, INSERTED.SubCategory AS subCategory,
               INSERTED.Description AS description
        VALUES (@name, @price, @stock, @image, @category, @subCategory, @description)
      `);

    const product = result.recordset[0];
    await saveSpecs(transaction, product.id, specs);
    await saveImages(transaction, product.id, images);
    await transaction.commit();

    res.status(201).json({ ...product, specs, images });
  } catch (err) {
    if (transaction) await transaction.rollback().catch(() => {});
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Edit a product (admin only)
app.put("/api/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { name, price, stock, category, subCategory, description } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const invalid = validateProduct(req.body);
  if (invalid) {
    return res.status(400).json({ message: invalid });
  }

  const specs = cleanSpecs(req.body.specs);
  const images = cleanImages(req.body);
  let transaction;

  try {
    const pool = await getPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const result = await new sql.Request(transaction)
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar(150), name.trim())
      .input("price", sql.Decimal(10, 2), Number(price))
      .input("stock", sql.Int, Number(stock))
      .input("image", sql.NVarChar(255), images[0] || null)
      .input("category", sql.NVarChar(100), category)
      .input("subCategory", sql.NVarChar(100), subCategory || null)
      .input("description", sql.NVarChar(sql.MAX), description?.trim() || null)
      .query(`
        UPDATE Products
        SET Name = @name, Price = @price, Stock = @stock, Image = @image,
            Category = @category, SubCategory = @subCategory, Description = @description
        OUTPUT INSERTED.Id AS id, INSERTED.Name AS name, INSERTED.Price AS price,
               INSERTED.Stock AS stock, INSERTED.Image AS image,
               INSERTED.Category AS category, INSERTED.SubCategory AS subCategory,
               INSERTED.Description AS description
        WHERE Id = @id
      `);

    if (result.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    await saveSpecs(transaction, id, specs);
    await saveImages(transaction, id, images);
    await transaction.commit();

    res.json({ ...result.recordset[0], specs, images });
  } catch (err) {
    if (transaction) await transaction.rollback().catch(() => {});
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Admin login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("username", sql.NVarChar(50), username)
      .query(
        "SELECT AdminId, Username, PasswordHash FROM Admins WHERE Username = @username",
      );

    const admin = result.recordset[0];
    const passwordOk =
      admin && (await bcrypt.compare(password, admin.PasswordHash));

    if (!passwordOk) {
      // Username වැරදිද password වැරදිද කියලා කියන්නේ නැහැ (ආරක්ෂාවට)
      return res.status(401).json({ message: "Invalid username or password" });
    }

    await pool
      .request()
      .input("id", sql.Int, admin.AdminId)
      .query(
        "UPDATE Admins SET LastLoginAt = SYSDATETIME() WHERE AdminId = @id",
      );

    const token = jwt.sign(
      { adminId: admin.AdminId, username: admin.Username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({ token, username: admin.Username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
