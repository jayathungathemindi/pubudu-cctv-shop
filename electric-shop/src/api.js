// Where the shop gets its products.
// On your computer (npm run dev) they come from the server and SQL Server.
// The public site (npm run build:static) has no server - it reads data/products.json,
// which "npm run export-products" (in the server folder) makes from the database.
export const isStaticSite = import.meta.env.MODE === "static";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Server error");
  return res.json();
}

export function fetchProducts() {
  return getJson(isStaticSite ? "/data/products.json" : "/api/products");
}

// One product with its description, specifications and images
export async function fetchProduct(id) {
  if (!isStaticSite) return getJson(`/api/products/${id}`);

  const product = (await fetchProducts()).find((p) => p.id === Number(id));
  if (!product) throw new Error("Product not found");
  return product;
}
