import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getToken, getUsername, logout } from "../../auth";
import AddProduct from "./AddProduct";
import { categories } from "../../categories";
import "./Admin.css";

const API_URL = "http://localhost:5000/api/products";

function AdminPage() {
  const navigate = useNavigate();
  const token = getToken();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch(() => setError("Could not load products. Is the server running?"))
      .finally(() => setLoading(false));
  }, [token]);

  // Not logged in? Go to the login page
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const handleSessionExpired = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setDeletingId(product.id);
    try {
      const res = await fetch(`${API_URL}/${product.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Login expired - go back to the login page
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Could not delete the product");
      }

      setProducts(products.filter((p) => p.id !== product.id));
    } catch (err) {
      alert(err.message === "Failed to fetch" ? "Could not reach the server" : err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Every word typed must appear in the product name or category
  const searchWords = search.toLowerCase().split(" ").filter(Boolean);

  const filteredProducts = products.filter((product) => {
    const text =
      `${product.name} ${product.category} ${product.subCategory ?? ""}`.toLowerCase();
    return searchWords.every((word) => text.includes(word));
  });

  return (
    <div className="admin-page">
      <header className="admin-header">
        <img src="/images/logo.png" alt="Pubudu CCTV & Electricals" />

        <div className="admin-header-right">
          <span className="admin-user">👤 {getUsername()}</span>
          <Link to="/" className="admin-btn light">
            View Shop
          </Link>
          <button className="admin-btn light" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-title-row">
          <div>
            <h1>Products</h1>
            <p>{products.length} products in your shop</p>
          </div>
          <button className="admin-btn primary" onClick={() => setShowAddForm(true)}>
            + Add Product
          </button>
        </div>

        {loading && <p className="admin-info">Loading products...</p>}
        {error && <p className="admin-error">{error}</p>}

        {!loading && !error && (
          <div className="admin-search">
            <input
              type="search"
              placeholder="🔍 Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search.trim() && (
              <span className="admin-info">
                {filteredProducts.length} of {products.length} products
              </span>
            )}
          </div>
        )}

        {!loading && !error && search.trim() && filteredProducts.length === 0 && (
          <p className="admin-info">No products match "{search}".</p>
        )}

        {!loading && !error && (filteredProducts.length > 0 || !search.trim()) && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price (Rs.)</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <span className="no-image">No image</span>
                      )}
                    </td>
                    <td className="product-name">{product.name}</td>
                    <td>
                      {product.category}
                      {product.subCategory && (
                        <span className="sub-category"> › {product.subCategory}</span>
                      )}
                    </td>
                    <td>{Number(product.price).toLocaleString()}</td>
                    <td>
                      <span className={product.stock > 0 ? "badge in" : "badge out"}>
                        {product.stock > 0 ? product.stock : "Out of stock"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => setEditingProduct(product)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showAddForm && (
        <AddProduct
          categories={categories}
          token={token}
          onClose={() => setShowAddForm(false)}
          onAdded={(newProduct) => setProducts([...products, newProduct])}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {editingProduct && (
        <AddProduct
          key={editingProduct.id}
          categories={categories}
          token={token}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={(updated) =>
            setProducts(products.map((p) => (p.id === updated.id ? updated : p)))
          }
          onSessionExpired={handleSessionExpired}
        />
      )}
    </div>
  );
}

export default AdminPage;
