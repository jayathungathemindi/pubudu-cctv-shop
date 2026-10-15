import { useState } from "react";
import { Link } from "react-router-dom";
import { shopInfo, whatsappLink } from "../../shopInfo";
import "./Contact.css";

// Simple line icons
const icons = {
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  ),
  chat: (
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </>
  ),
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
};

function Icon({ name }) {
  return (
    <svg
      className="contact-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Opens WhatsApp with the customer's message already typed
  const handleSubmit = (e) => {
    e.preventDefault();
    const text =
      `Hello Pubudu CCTV & Electricals,\n\n${form.message}\n\n` +
      `Name: ${form.name}` +
      (form.phone ? `\nPhone: ${form.phone}` : "");
    window.open(whatsappLink(text), "_blank", "noopener");
  };

  return (
    <div className="contact-page">
      <header className="contact-header">
        <Link to="/">
          <img src="/images/logo.png" alt="Pubudu CCTV & Electricals" />
        </Link>
        <Link to="/" className="contact-back">
          ← Back to shop
        </Link>
      </header>

      <main className="contact-main">
        <section className="contact-intro">
          <span className="contact-eyebrow">Contact</span>
          <h1>We're here to help</h1>
          <p>
            Questions about a product, a CCTV installation, or an order? Reach
            out and our team will get back to you shortly.
          </p>
        </section>

        <section className="contact-cards">
          <a className="contact-card" href={`tel:${shopInfo.phoneLink}`}>
            <Icon name="phone" />
            <h2>Call us</h2>
            <p>{shopInfo.phone}</p>
          </a>

          <a
            className="contact-card"
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="chat" />
            <h2>WhatsApp</h2>
            <p>Chat with us</p>
          </a>

          <a className="contact-card" href={`mailto:${shopInfo.email}`}>
            <Icon name="mail" />
            <h2>Email</h2>
            <p>{shopInfo.email}</p>
          </a>

          <a
            className="contact-card"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              shopInfo.mapQuery,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="pin" />
            <h2>Visit us</h2>
            <p>{shopInfo.address}</p>
          </a>
        </section>

        <section className="contact-bottom">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Send a message</h2>
            <p className="contact-muted">
              Your message will open in WhatsApp, ready to send.
            </p>

            <div className="contact-form-row">
              <label>
                Your name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Phone (optional)
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label>
              Message
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                required
              />
            </label>

            <button type="submit" className="contact-submit">
              Send message
            </button>
          </form>

          <aside className="contact-side">
            <div className="contact-hours">
              <h2>
                <Icon name="clock" /> Opening hours
              </h2>
              <ul>
                {shopInfo.hours.map((h) => (
                  <li key={h.days}>
                    <span>{h.days}</span>
                    <span>{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </main>

      <footer className="contact-footer">
        © {new Date().getFullYear()} Pubudu CCTV & Electricals
      </footer>
    </div>
  );
}

export default ContactPage;
