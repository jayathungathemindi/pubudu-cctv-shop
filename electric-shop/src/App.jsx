import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/pages/Home";
import AdminPage from "./components/pages/AdminPage";
import AdminLogin from "./components/pages/AdminLogin";
import ContactPage from "./components/pages/ContactPage";
import { CartDrawer } from "./components/pages/Cart";
import { isStaticSite } from "./api";
import "./App.css";

function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>404</h1>
      <p>මේ page එක හොයාගන්න බැහැ.</p>
      <Link to="/">← Home එකට යන්න</Link>
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* The public site has no server, so admin only works on your computer */}
        {!isStaticSite && (
          <>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPage />} />
          </>
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CartDrawer />
    </>
  );
}

export default App;
