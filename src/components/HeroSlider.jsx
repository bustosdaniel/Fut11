import { useEffect, useState } from 'react';
import './HeroSlider.css';

const SLIDES = [
  { id: 1, image: '/images/ronaldo_2002.jpg', title: 'Brasil 2002', position: 'bottom-left' },
  { id: 2, image: '/images/dinho_2002.jpg', title: 'Brasil 2002', position: 'top-right' },
  { id: 3, image: '/images/gol_2002.jpg', title: 'Corea/Japón 2002', position: 'bottom-left' },
  { id: 4, image: '/images/maxi_2006.jpg', title: 'Alemania 2006', position: 'top-right' },
  { id: 5, image: '/images/gol_iniesta_2010.jpg', title: 'Sudáfrica 2010', position: 'bottom-left' },
  { id: 6, image: '/images/messi_2014.jpg', title: 'Brasil 2014', position: 'top-right' },
  { id: 7, image: '/images/james_2014.jpg', title: 'Brasil 2014', position: 'bottom-left' },
  { id: 8, image: '/images/van_persie_2014.jpg', title: 'Brasil 2014', position: 'top-right' },
  { id: 9, image: '/images/volea_2014.jpg', title: 'Brasil 2014', position: 'bottom-left' },
  { id: 10, image: '/images/gotze_2015.jpg', title: 'Brasil 2014', position: 'top-right' },
  { id: 11, image: '/images/cr7_2018.jpg', title: 'Rusia 2018', position: 'bottom-left' },
  { id: 12, image: '/images/mbappe_2022.jpg', title: 'Qatar 2022', position: 'top-right' },
  { id: 13, image: '/images/dimaria_2022.jpg', title: 'Qatar 2022', position: 'bottom-left' },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  function goTo(index) {
    setCurrent(index);
  }

  function prev() {
    setCurrent((current - 1 + SLIDES.length) % SLIDES.length);
  }

  function next() {
    setCurrent((current + 1) % SLIDES.length);
  }

  return (
    <section className="hero-slider" aria-label="Momentos icónicos de los mundiales">
      <div
        className="hero-slider-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="hero-slide"
            aria-hidden={false}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="hero-slide-image"
              loading="eager"
            />
            <div className="hero-slide-overlay" />
            <div className={`hero-slide-content ${slide.position}`}>
              <h2 className="hero-slide-title">{slide.title}</h2>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="hero-slider-arrow hero-slider-arrow-prev"
        onClick={prev}
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        type="button"
        className="hero-slider-arrow hero-slider-arrow-next"
        onClick={next}
        aria-label="Siguiente"
      >
        ›
      </button>

      <div className="hero-slider-dots">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`hero-slider-dot ${index === current ? 'active' : ''}`}
            onClick={() => goTo(index)}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
