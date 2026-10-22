import WhatsAppButton from "./WhatsAppButton";
import { AddToCartButton } from "./Cart";
import "./ProductCard.css";

function ProductCard(props) {
  const inStock = props.stock > 0;

  // Open the details popup with the mouse or the Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      props.onClick();
    }
  };

  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      onClick={props.onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="card-image">
        {!inStock && <span className="card-badge out">Out of Stock</span>}
        {props.image ? (
          <img src={props.image} alt={props.name} />
        ) : (
          <span className="card-no-image">No image</span>
        )}
      </div>

      <div className="card-body">
        <h3>{props.name}</h3>
        <p className="price">Rs. {Number(props.price).toLocaleString()}</p>

        {inStock ? (
          <div className="card-buttons">
            <AddToCartButton className="card-cart-btn" product={props.product} />
            <WhatsAppButton product={props.product} iconOnly />
          </div>
        ) : (
          <div className="card-buttons">
            <WhatsAppButton className="card-ask-btn" product={props.product} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
