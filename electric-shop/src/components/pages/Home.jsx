import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import HeroSlider from "./HeroSlider";
//import AddProduct from "./AddProduct";
import "./Home.css";

const API_URL = "http://localhost:5000/api/products";

const categories = [
  { name: "TV & Home Audio", icon: "📺" },
  { name: "CCTV & Security", icon: "📹" },
  { name: "Kitchen Appliances", icon: "🍳" },
  { name: "Hardware & Electrical", icon: "🔌" },
];

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const [activeSection, setActiveSection] = useState("home");

  const closeDetails = useCallback(() => setSelectedProductId(null), []);

  // Highlight "Products" in the menu when the products section is on screen
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("products");
      if (!section) return;
      const reached =
        section.getBoundingClientRect().top < window.innerHeight / 2;
      setActiveSection(reached ? "products" : "home");
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load products from the server (SQL Server)
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch(() => setError("Could not load products. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  // Show a newly added product without reloading the page
  /*const handleProductAdded = (newProduct) => {
    setProducts([...products, newProduct]);
  };*/

  // Close the dropdown when clicking outside it
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const chooseCategory = (name) => {
    setSelectedCategory(name);
    setMenuOpen(false);
    scrollToProducts();
  };

  const scrollToProducts = () =>
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });

  // Every word typed must appear in the product name or category
  const searchWords = search.toLowerCase().split(" ").filter(Boolean);

  const filteredProducts = products.filter((product) => {
    const inCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const text = `${product.name} ${product.category}`.toLowerCase();
    const matchesSearch = searchWords.every((word) => text.includes(word));
    return inCategory && matchesSearch;
  });

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearch("");
  };

  let title = "Our Products";
  if (search.trim()) title = `Results for "${search.trim()}"`;
  else if (selectedCategory !== "All") title = selectedCategory;

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <h1 className="logo">
            <img src="/images/logo.png" alt="Pubudu CCTV & Electricals" />
          </h1>

          <form
            className="search-bar"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              scrollToProducts();
            }}
          >
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your products..."
              aria-label="Search products"
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </form>

          <nav className="nav">
            <div className="nav-pills">
              <a
                href="#home"
                className={
                  activeSection === "home" ? "nav-item active" : "nav-item"
                }
              >
                <span className="nav-icon">🏠</span> Home
              </a>

              <div className="nav-dropdown" ref={dropdownRef}>
                <button
                  className={
                    menuOpen || activeSection === "products"
                      ? "nav-item active"
                      : "nav-item"
                  }
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <span className="nav-icon">🛍️</span> Products{" "}
                  <span className={menuOpen ? "arrow open" : "arrow"}>▾</span>
                </button>

                {menuOpen && (
                  <div className="dropdown-menu">
                    <button onClick={() => chooseCategory("All")}>
                      <span>🛒</span> All Products
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => chooseCategory(category.name)}
                      >
                        <span>{category.icon}</span> {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Link to="/contact" className="nav-cta">
              <span className="nav-icon">📞</span> Contact Us
            </Link>

            {/* <button
              className="add-product-btn"
              onClick={() => setShowAddForm(true)} 
            >
              + Add Product
            </button> */}
          </nav>
        </div>
      </header>
      <HeroSlider />
      <div className="shop">
        <h2 className="section-title" id="products">
          {title}
        </h2>

        {(selectedCategory !== "All" || search.trim()) && (
          <button className="show-all-btn" onClick={clearFilters}>
            ← Show all products
          </button>
        )}

        {loading && <p className="no-products">Loading products...</p>}
        {error && <p className="no-products">{error}</p>}

        <div className="product-list">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              stock={product.stock}
              image={product.image}
              onClick={() => setSelectedProductId(product.id)}
            />
          ))}
        </div>

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="no-products">
            {search.trim()
              ? "No products match your search. Try another word, or ask us on WhatsApp."
              : "No products in this category yet."}
          </p>
        )}
      </div>

      {selectedProductId && (
        <ProductDetails productId={selectedProductId} onClose={closeDetails} />
      )}

      {/* {showAddForm && (
        <AddProduct
          categories={categories}
          onClose={() => setShowAddForm(false)}
          onAdded={handleProductAdded}
        />
      )} */}
    </>
  );
}

export default Home;
