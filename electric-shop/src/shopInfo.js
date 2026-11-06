// ✏️ Change your shop details here - used by the Contact page and product cards
export const shopInfo = {
  name: "Pubudu CCTV & Electricals",
  phone: "+94 71 3680295", // shown on the page
  phoneLink: "+94713680295", // used for "click to call" (no spaces)
  whatsapp: "94713680295", // country code + number, no + or spaces
  email: "jayathungathemindi@gmail.com",
  address:
    "No. 81/A, Deraniyagala, Kegalle District, Sabaragamuwa Province, Sri Lanka",
  mapQuery: "Deraniyagala, Kegalle, Sri Lanka", // what Google Maps should search for
  hours: [
    { days: "Monday – Friday", time: "8:30 AM – 6:30 PM" },
    { days: "Weekend", time: "9:00 AM – 5:00 PM" },
  ],
};

// Link that opens WhatsApp chat with the shop (with a message typed if given)
export function whatsappLink(message = "") {
  const base = `https://wa.me/${shopInfo.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Message a customer sends about a product
export function productMessage(product) {
  const price = Number(product.price).toLocaleString();
  return product.stock > 0
    ? `Hello ${shopInfo.name}, I'm interested in "${product.name}" (Rs. ${price}). Is it available?`
    : `Hello ${shopInfo.name}, I'm interested in "${product.name}" (Rs. ${price}). When will it be back in stock?`;
}
