import { useEffect, useState } from "react";
import WhatsAppButton from "./WhatsAppButton";
import { AddToCartButton } from "./Cart";
import { fetchProduct } from "../../api";
import "./ProductDetails.css";

function ProductDetails({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  // Load the full product (with specifications) from the server
  useEffect(() => {
    fetchProduct(productId)
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
  const images = product?.images ?? (product?.image ? [product.image] : []);

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
              <div className="details-gallery">
                <div className="details-image">
                  {images.length > 0 ? (
                    <img src={images[activeImage]} alt={product.name} />
                  ) : (
                    <span>No image</span>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="details-thumbs">
                    {images.map((url, index) => (
                      <button
                        key={index}
                        className={index === activeImage ? "thumb active" : "thumb"}
                        onClick={() => setActiveImage(index)}
                        aria-label={`Show image ${index + 1}`}
                      >
                        <img src={url} alt="" />
                      </button>
                    ))}
                  </div>
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

                <div className="details-buttons">
                  <AddToCartButton className="details-button" product={product} />
                  <WhatsAppButton className="details-button" product={product} />
                </div>
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
