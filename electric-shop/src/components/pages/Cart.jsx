import { useEffect } from "react";
import { cartMessage, useCart } from "../../cart";
import { whatsappLink } from "../../shopInfo";
import "./WhatsAppButton.css";
import "./Cart.css";

const cartIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
);

// Cart button for the header, with the number of items
export function CartButton() {
  const { count, openCart } = useCart();

  return (
    <button
      className="cart-btn"
      onClick={openCart}
      aria-label={`Cart, ${count} items`}
    >
      {cartIcon}
      <span className="cart-btn-label">Cart</span>
      {count > 0 && <span className="cart-count">{count}</span>}
    </button>
  );
}

// "Add to Cart" button for product cards and the details popup
export function AddToCartButton({ product, className = "" }) {
  const { items, addItem, openCart } = useCart();
  const inCart = items.find((item) => item.id === product.id);

  if (product.stock <= 0) return null;

  const handleClick = (e) => {
    e.stopPropagation(); // don't also open the product details popup
    // Already in the cart: just show the cart (change the amount there)
    if (!inCart) addItem(product);
    openCart();
  };

  return (
    <button
      className={`add-to-cart-btn ${className}`}
      onClick={handleClick}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {cartIcon}
      {inCart ? `In Cart (${inCart.qty})` : "Add to Cart"}
    </button>
  );
}

// Panel that slides in from the right with everything in the cart
export function CartDrawer() {
  const { items, total, isOpen, closeCart, setQty, removeItem, clearCart } =
    useCart();

  // Close with the Esc key, and stop the page behind from scrolling
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => e.key === "Escape" && closeCart();
    // The product popup may already have stopped scrolling - put back what was there
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={closeCart}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-label="Your cart"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close" onClick={closeCart} aria-label="Close">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button className="cart-continue" onClick={closeCart}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => (
                <li className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    {item.image ? <img src={item.image} alt="" /> : null}
                  </div>

                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">
                      Rs. {Number(item.price).toLocaleString()}
                    </p>

                    <div className="cart-item-actions">
                      <div className="qty">
                        <button
                          onClick={() => setQty(item.id, item.qty - 1)}
                          disabled={item.qty <= 1}
                          aria-label="One less"
                        >
                          −
                        </button>
                        <span>{item.qty}</span>
                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          disabled={item.qty >= item.stock}
                          aria-label="One more"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-remove"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                    {item.qty >= item.stock && (
                      <p className="cart-item-limit">Only {item.stock} in stock</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>Rs. {total.toLocaleString()}</strong>
              </div>

              <a
                className="whatsapp-btn cart-whatsapp"
                href={whatsappLink(cartMessage(items, total))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
                </svg>
                Send Order on WhatsApp
              </a>

              <button className="cart-clear" onClick={clearCart}>
                Empty cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
