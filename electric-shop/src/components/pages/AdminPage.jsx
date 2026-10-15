import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getToken, getUsername, logout } from "../../auth";
import AddProduct from "./AddProduct";
import "./Admin.css";

const API_URL = "http://localhost:5000/api/products";

const categories = [
  { name: "TV & Home Audio" },
  { name: "CCTV & Security" },
  { name: "Kitchen Appliances" },
  { name: "Hardware & Electrical" },
];

function AdminPage() {
  const navigate = useNavigate();
  const token = getToken();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <span className="no-image">No image</span>
                      )}
                    </td>
                    <td className="product-name">{product.name}</td>
                    <td>{product.category}</td>
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
