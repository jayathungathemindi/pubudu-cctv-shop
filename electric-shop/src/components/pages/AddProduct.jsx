import { useEffect, useState } from "react";
import "./AddProduct.css";

const emptyForm = {
  name: "",
  price: "",
  stock: "",
  image: "",
  category: "",
  description: "",
};

const emptySpec = { label: "", value: "" };

// If "product" is given, the form edits that product. Otherwise it adds a new one.
function AddProduct({
  categories,
  token,
  product,
  onClose,
  onAdded,
  onUpdated,
  onSessionExpired,
}) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(
    isEdit
      ? {
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.image || "",
          category: product.category,
          description: "",
        }
      : emptyForm,
  );
  const [specs, setSpecs] = useState([{ ...emptySpec }]);
  const [loadingDetails, setLoadingDetails] = useState(isEdit);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // When editing, load the description and specifications too
  useEffect(() => {
    if (!isEdit) return;
    fetch(`http://localhost:5000/api/products/${product.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        setForm((f) => ({ ...f, description: data.description || "" }));
        setSpecs(data.specs.length > 0 ? data.specs : [{ ...emptySpec }]);
      })
      .catch(() => setError("Could not load product details."))
      .finally(() => setLoadingDetails(false));
  }, [isEdit, product]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const changeSpec = (index, field, value) => {
    setSpecs(specs.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addSpec = () => setSpecs([...specs, { ...emptySpec }]);

  const removeSpec = (index) => {
    const next = specs.filter((_, i) => i !== index);
    setSpecs(next.length > 0 ? next : [{ ...emptySpec }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = isEdit
        ? `http://localhost:5000/api/products/${product.id}`
        : "http://localhost:5000/api/products";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, specs }),
      });
      const data = await res.json();

      // Login expired - go back to the login page
      if (res.status === 401) {
        onSessionExpired();
        return;
      }

      if (!res.ok) {
        setError(data.message || "Could not save product");
        return;
      }

      if (isEdit) {
        onUpdated(data);
      } else {
        onAdded(data);
      }
      onClose();
    } catch {
      setError("Could not connect to the server. Is it running?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="add-product-form"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="form-header">
          <h2>{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button type="button" className="form-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <label>
          Product Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Samsung TV 43 inch"
            required
          />
        </label>

        <div className="form-row">
          <label>
            Price (Rs.)
            <input
              name="price"
              type="number"
              min="1"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 85000"
              required
            />
          </label>

          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="e.g. 10"
              required
            />
          </label>
        </div>

        <label>
          Category
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">-- Choose a category --</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Image Path
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="e.g. /images/samsung-tv.jpg"
          />
        </label>

        {form.image && (
          <img className="image-preview" src={form.image} alt="Preview" />
        )}

        <label>
          Description
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description shown to customers"
          />
        </label>

        <div className="specs-editor">
          <div className="specs-title">
            Specifications
            <span>e.g. Capacity → 1.6 Liters</span>
          </div>

          {loadingDetails ? (
            <p className="specs-loading">Loading...</p>
          ) : (
            specs.map((spec, index) => (
              <div className="spec-row" key={index}>
                <input
                  value={spec.label}
                  onChange={(e) => changeSpec(index, "label", e.target.value)}
                  placeholder="Name (e.g. Color)"
                />
                <input
                  value={spec.value}
                  onChange={(e) => changeSpec(index, "value", e.target.value)}
                  placeholder="Value (e.g. Grey)"
                />
                <button
                  type="button"
                  className="spec-remove"
                  onClick={() => removeSpec(index)}
                  aria-label="Remove row"
                >
                  ✕
                </button>
              </div>
            ))
          )}

          <button type="button" className="spec-add" onClick={addSpec}>
            + Add row
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-buttons">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={saving || loadingDetails}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
