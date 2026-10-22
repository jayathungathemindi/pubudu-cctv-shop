import "./Highlights.css";

// Delivery truck with "FREE" on the side
const truckIcon = (
  <svg viewBox="0 0 64 48" aria-hidden="true">
    <rect x="2" y="8" width="38" height="26" rx="3" fill="var(--brand)" />
    <text
      x="21"
      y="25"
      textAnchor="middle"
      fontSize="9"
      fontWeight="800"
      fill="#ffffff"
      fontFamily="inherit"
    >
      FREE
    </text>
    <path d="M40 16h11l9 10v8H40z" fill="var(--brand-dark)" />
    <path d="M44 19h6l5 6H44z" fill="#ffffff" opacity="0.85" />
    <circle cx="14" cy="38" r="6" fill="var(--ink)" />
    <circle cx="14" cy="38" r="2.5" fill="#ffffff" />
    <circle cx="50" cy="38" r="6" fill="var(--ink)" />
    <circle cx="50" cy="38" r="2.5" fill="#ffffff" />
  </svg>
);

// Speedometer with the needle near the top
const speedIcon = (
  <svg viewBox="0 0 64 48" aria-hidden="true">
    <path
      d="M8 40a24 24 0 0 1 48 0"
      fill="none"
      stroke="var(--line)"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path
      d="M8 40a24 24 0 0 1 7-17"
      fill="none"
      stroke="#f5b400"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path
      d="M15 23a24 24 0 0 1 34 0"
      fill="none"
      stroke="#f07c1b"
      strokeWidth="6"
    />
    <path
      d="M49 23a24 24 0 0 1 7 17"
      fill="none"
      stroke="var(--brand)"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path d="M32 40 47 24" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="40" r="4" fill="var(--ink)" />
  </svg>
);

// Banknote with a hand underneath
const cashIcon = (
  <svg viewBox="0 0 64 48" aria-hidden="true">
    <rect x="10" y="4" width="44" height="24" rx="3" fill="#2e9e5b" />
    <rect x="14" y="8" width="36" height="16" rx="2" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
    <circle cx="32" cy="16" r="6" fill="#ffffff" opacity="0.9" />
    <text
      x="32"
      y="19"
      textAnchor="middle"
      fontSize="8"
      fontWeight="800"
      fill="#2e9e5b"
      fontFamily="inherit"
    >
      Rs
    </text>
    <path
      d="M4 40c6-6 12-8 18-6l10 3c3 1 3 5 0 5H22"
      fill="none"
      stroke="var(--brand)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 42l14-6c4-2 7 2 4 5L38 46H4"
      fill="none"
      stroke="var(--brand)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const highlights = [
  {
    icon: truckIcon,
    title: "Island-wide Free Delivery",
    text: "We Deliver to Every Corner of Sri Lanka",
  },
  {
    icon: speedIcon,
    title: "Fast Shipping",
    text: "At Your Doorstep Within 1-4 Days",
  },
  {
    icon: cashIcon,
    title: "Cash on Delivery",
    text: "Pay When Your Order Arrives",
  },
];

// Delivery highlights shown under the banner
function Highlights() {
  return (
    <section className="highlights" aria-label="Delivery information">
      {highlights.map((item) => (
        <div className="highlight" key={item.title}>
          <div className="highlight-icon">{item.icon}</div>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Highlights;
