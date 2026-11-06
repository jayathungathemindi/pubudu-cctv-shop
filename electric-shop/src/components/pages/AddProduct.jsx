import { useEffect, useState } from "react";
import { subCategoriesOf } from "../../categories";
import "./AddProduct.css";

const emptyForm = {
  name: "",
  price: "",
  stock: "",
  category: "",
  subCategory: "",
  description: "",
};

const emptySpec = { label: "", value: "" };

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB, same as the server
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
          category: product.category,
          subCategory: product.subCategory || "",
          description: "",
        }
      : emptyForm,
  );
  // First image is the main one (shown on the product card)
  const [images, setImages] = useState(
    isEdit && product.image ? [product.image] : [""],
  );
  const [specs, setSpecs] = useState([{ ...emptySpec }]);
  const [loadingDetails, setLoadingDetails] = useState(isEdit);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // When editing, load the description and specifications too
  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/products/${product.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        setForm((f) => ({ ...f, description: data.description || "" }));
        setSpecs(data.specs.length > 0 ? data.specs : [{ ...emptySpec }]);
        if (data.images?.length > 0) setImages(data.images);
      })
      .catch(() => setError("Could not load product details."))
      .finally(() => setLoadingDetails(false));
  }, [isEdit, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // A new category has different sub-categories - clear the old choice
    if (name === "category") {
      setForm({ ...form, category: value, subCategory: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const subCategories = subCategoriesOf(form.category);

  const changeSpec = (index, field, value) => {
    setSpecs(specs.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const changeImage = (index, value) => {
    setImages(images.map((url, i) => (i === index ? value : url)));
  };

  // Send the chosen file to the server and put its URL in this image row
  const uploadImage = async (index, file) => {
    if (!file) return;
    setError("");

    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, WEBP or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image is too big (max 5 MB).");
      return;
    }

    setUploadingIndex(index);
    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          Authorization: `Bearer ${token}`,
        },
        body: file,
      });

      // Login expired - go back to the login page
      if (res.status === 401) {
        onSessionExpired();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not upload the image");
        return;
      }

      setImages((current) => current.map((url, i) => (i === index ? data.url : url)));
    } catch {
      setError("Could not connect to the server. Is it running?");
    } finally {
      setUploadingIndex(null);
    }
  };

  const addImage = () => setImages([...images, ""]);

  const removeImage = (index) => {
    const next = images.filter((_, i) => i !== index);
    setImages(next.length > 0 ? next : [""]);
  };

  // Move an image to the front so it becomes the main image
  const makeMainImage = (index) => {
    setImages([images[index], ...images.filter((_, i) => i !== index)]);
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
        ? `/api/products/${product.id}`
        : "/api/products";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, images, specs }),
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
            maxLength={150}
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

        {subCategories.length > 0 && (
          <label>
            Sub-category
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
            >
              <option value="">-- Choose a sub-category --</option>
              {subCategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="images-editor">
          <div className="specs-title">
            Images
            <span>The first image is shown on the product card</span>
          </div>

          {loadingDetails ? (
            <p className="specs-loading">Loading...</p>
          ) : (
            images.map((url, index) => (
              <div className="image-row" key={index}>
                <div className="image-thumb">
                  {url ? <img src={url} alt="" /> : <span>No image</span>}
                </div>
                <div className="image-row-fields">
                  <div className="image-input-row">
                    <input
                      value={url}
                      onChange={(e) => changeImage(index, e.target.value)}
                      placeholder="Upload a photo or type /images/samsung-tv.jpg"
                    />
                    <label
                      className={
                        uploadingIndex === index ? "image-upload busy" : "image-upload"
                      }
                    >
                      {uploadingIndex === index ? "Uploading..." : "📁 Upload"}
                      <input
                        type="file"
                        accept={IMAGE_TYPES.join(",")}
                        disabled={uploadingIndex !== null}
                        onChange={(e) => {
                          uploadImage(index, e.target.files[0]);
                          e.target.value = ""; // allow choosing the same file again
                        }}
                      />
                    </label>
                  </div>
                  {index === 0 ? (
                    <span className="image-main-tag">Main image</span>
                  ) : (
                    <button
                      type="button"
                      className="image-make-main"
                      onClick={() => makeMainImage(index)}
                    >
                      Make main
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="spec-remove"
                  onClick={() => removeImage(index)}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))
          )}

          {images.length < MAX_IMAGES && (
            <button type="button" className="spec-add" onClick={addImage}>
              + Add image
            </button>
          )}
        </div>

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
            disabled={saving || loadingDetails || uploadingIndex !== null}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
