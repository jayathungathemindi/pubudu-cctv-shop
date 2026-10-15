import { useEffect, useState } from "react";

const slides = [
  { image: "/images/hero-banner.png", alt: "Home Appliances Banner" },
  { image: "/images/cctv-banner.png", alt: "Secure Home CCTV Solutions" },
  { image: "/images/Upgrade Your Home Entertainment.png", alt: "tv and jbl" },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  // Go to the next slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [current]);

  const prevSlide = () =>
    setCurrent((current - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrent((current + 1) % slides.length);

  return (
    <div className="hero-slider" id="home">
      <div
        className="slider-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <img key={slide.image} src={slide.image} alt={slide.alt} />
        ))}
      </div>

      <button className="slider-arrow left" onClick={prevSlide}>
        ‹
      </button>
      <button className="slider-arrow right" onClick={nextSlide}>
        ›
      </button>

      <div className="slider-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            className={index === current ? "dot active" : "dot"}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;
