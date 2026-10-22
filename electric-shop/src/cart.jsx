import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { shopInfo } from "./shopInfo";

// The cart is saved in the browser, so it is still there after a page refresh
const STORAGE_KEY = "cart";

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

const CartContext = createContext(null);

// Each cart item: { id, name, price, image, stock, qty }
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage blocked (e.g. private window) - the cart still works until refresh
    }
  }, [items]);

  // Adds one more of the product (never more than the stock)
  const addItem = useCallback((product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, qty: Math.min(item.qty + 1, product.stock) }
            : item,
        );
      }
      const { id, name, price, image, stock } = product;
      return [...current, { id, name, price, image, stock, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, Math.min(qty, item.stock)) }
          : item,
      ),
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // Use the latest name, price and stock from the shop. Products that were
  // deleted or went out of stock are taken out of the cart.
  const syncWithProducts = useCallback((products) => {
    setItems((current) =>
      current.flatMap((item) => {
        const latest = products.find((p) => p.id === item.id);
        if (!latest || latest.stock <= 0) return [];
        return [
          {
            ...item,
            name: latest.name,
            price: latest.price,
            image: latest.image,
            stock: latest.stock,
            qty: Math.min(item.qty, latest.stock),
          },
        ];
      }),
    );
  }, []);

  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.qty * Number(item.price), 0);

  const value = {
    items,
    count,
    total,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    setQty,
    removeItem,
    clearCart,
    syncWithProducts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

// WhatsApp message listing everything in the cart
export function cartMessage(items, total) {
  const lines = items.map((item, index) => {
    const lineTotal = (item.qty * Number(item.price)).toLocaleString();
    return `${index + 1}. ${item.name} × ${item.qty} = Rs. ${lineTotal}`;
  });

  return [
    `Hello ${shopInfo.name}, I'd like to order:`,
    "",
    ...lines,
    "",
    `Total: Rs. ${total.toLocaleString()}`,
    "",
    "Are these available?",
  ].join("\n");
}
