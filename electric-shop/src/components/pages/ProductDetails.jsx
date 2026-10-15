import { useEffect, useState } from "react";
import WhatsAppButton from "./WhatsAppButton";
import "./ProductDetails.css";

function ProductDetails({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  // Load the full product (with specifications) from the server
  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch(() => setError("Could not load product details."));
  }, [productId]);

  // Close with the Esc key, and stop the page behind from scrolling
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const inStock = product && product.stock > 0;

  return (
    <div className="details-overlay" onClick={onClose}>
      <div className="details-box" onClick={(e) => e.stopPropagation()}>
        <button className="details-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {!product && !error && <p className="details-message">Loading...</p>}
        {error && <p className="details-message">{error}</p>}

        {product && (
          <>
            <div className="details-top">
              <div className="details-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <span>No image</span>
                )}
              </div>

              <div className="details-info">
                <span className="details-category">{product.category}</span>
                <h2>{product.name}</h2>
                <p className="details-price">
                  Rs. {Number(product.price).toLocaleString()}
                </p>
                {!inStock && <span className="details-stock out">Out of Stock</span>}

                {product.description && (
                  <p className="details-description">{product.description}</p>
                )}

                <WhatsAppButton className="details-whatsapp" product={product} />
              </div>
            </div>

            {product.specs.length > 0 && (
              <div className="details-specs">
                <h3>Specifications</h3>
                <table>
                  <tbody>
                    {product.specs.map((spec, index) => (
                      <tr key={index}>
                        <th>{spec.label}</th>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
