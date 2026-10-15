import { productMessage, whatsappLink } from "../../shopInfo";
import "./WhatsAppButton.css";

// Green button that opens WhatsApp with a message about the product
function WhatsAppButton({ product, className = "" }) {
  return (
    <a
      className={`whatsapp-btn ${className}`}
      href={whatsappLink(productMessage(product))}
      target="_blank"
      rel="noopener noreferrer"
      // Don't also open the product details popup
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
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
      {product.stock > 0 ? "Order on WhatsApp" : "Ask on WhatsApp"}
    </a>
  );
}

export default WhatsAppButton;
