import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import HeroSlider from "./HeroSlider";
import Highlights from "./Highlights";
import { CartButton } from "./Cart";
import { useCart } from "../../cart";
import { categories, subCategoriesOf } from "../../categories";
//import AddProduct from "./AddProduct";
import "./Home.css";

const API_URL = "http://localhost:5000/api/products";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSub, setSelectedSub] = useState(null); // e.g. "Kettle"
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const { syncWithProducts } = useCart();

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
      .then((data) => {
        setProducts(data);
        syncWithProducts(data); // keep cart prices and stock up to date
      })
      .catch(() => setError("Could not load products. Is the server running?"))
      .finally(() => setLoading(false));
  }, [syncWithProducts]);

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

  // sub = null means the whole category
  const chooseCategory = (name, sub = null) => {
    setSelectedCategory(name);
    setSelectedSub(sub);
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
    const inSub = !selectedSub || product.subCategory === selectedSub;
    const text =
      `${product.name} ${product.category} ${product.subCategory ?? ""}`.toLowerCase();
    const matchesSearch = searchWords.every((word) => text.includes(word));
    return inCategory && inSub && matchesSearch;
  });

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedSub(null);
    setSearch("");
  };

  // Quick filter buttons above the products, e.g. Rice Cooker, Kettle ...
  const subCategories = subCategoriesOf(selectedCategory);

  let title = "Our Products";
  if (search.trim()) title = `Results for "${search.trim()}"`;
  else if (selectedSub) title = selectedSub;
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
                    menuOpen ||
                    activeSection === "products" ||
                    selectedCategory !== "All"
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
                    {[{ name: "All", label: "All Products", icon: "🛒" }, ...categories].map(
                      (category) => {
                        const isSelected =
                          selectedCategory === category.name && !selectedSub;
                        return (
                          <div key={category.name}>
                            <button
                              className={isSelected ? "selected" : ""}
                              aria-current={isSelected ? "true" : undefined}
                              onClick={() => chooseCategory(category.name)}
                            >
                              <span>{category.icon}</span>
                              {category.label || category.name}
                              {isSelected && <span className="dropdown-check">✓</span>}
                            </button>

                            {category.subCategories && (
                              <div className="dropdown-sub">
                                {category.subCategories.map((sub) => {
                                  const subSelected =
                                    selectedCategory === category.name &&
                                    selectedSub === sub;
                                  return (
                                    <button
                                      key={sub}
                                      className={subSelected ? "selected" : ""}
                                      aria-current={subSelected ? "true" : undefined}
                                      onClick={() => chooseCategory(category.name, sub)}
                                    >
                                      {sub}
                                      {subSelected && (
                                        <span className="dropdown-check">✓</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            </div>

            <Link to="/contact" className="nav-cta">
              <span className="nav-icon">📞</span> Contact Us
            </Link>

            <CartButton />

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
      <Highlights />
      <div className="shop">
        <h2 className="section-title" id="products">
          {title}
        </h2>

        {(selectedCategory !== "All" || search.trim()) && (
          <button className="show-all-btn" onClick={clearFilters}>
            ← Show all products
          </button>
        )}

        {subCategories.length > 0 && (
          <div className="sub-filters">
            {[null, ...subCategories].map((sub) => (
              <button
                key={sub ?? "all"}
                className={selectedSub === sub ? "sub-chip active" : "sub-chip"}
                aria-pressed={selectedSub === sub}
                onClick={() => setSelectedSub(sub)}
              >
                {sub ?? "All"}
              </button>
            ))}
          </div>
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
              product={product}
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
