import WhatsAppButton from "./WhatsAppButton";
import "./ProductCard.css";

function ProductCard(props) {
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
      <img src={props.image} alt={props.name} />
      <h3>{props.name}</h3>

      <p className="price">Rs. {Number(props.price).toLocaleString()}</p>

      {props.stock === 0 && <p className="out-of-stock">Out of Stock</p>}

      <span className="view-details"></span>

      <WhatsAppButton
        className="card-whatsapp"
        product={{ name: props.name, price: props.price, stock: props.stock }}
      />
    </div>
  );
}

export default ProductCard;
