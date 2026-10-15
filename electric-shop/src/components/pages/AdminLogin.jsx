import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getToken, saveLogin } from "../../auth";
import "./Admin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in? Go straight to the admin page
  if (getToken()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      saveLogin(data.token, data.username);
      navigate("/admin", { replace: true });
    } catch {
      setError("Could not connect to the server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <img className="login-logo" src="/images/logo.png" alt="Pubudu CCTV & Electricals" />

        <h1>Admin Login</h1>
        <p className="login-subtitle">Sign in to manage your products</p>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="admin-btn primary" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <Link to="/" className="login-back">
          ← Back to shop
        </Link>
      </form>
    </div>
  );
}

export default AdminLogin;
