import { useState, useEffect, useCallback, useRef, type FC } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Salon } from '../services/mockApi';
import { 
  Search, 
  MapPin, 
  Heart, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

import bbeautyHeroImg from '../assets/bbeauty_hero.jpg';
import andrewSpaImg from '../assets/andrew_spa.jpg';
import alphaBeautyImg from '../assets/alpha_beauty.jpg';
import queenBSalonImg from '../assets/queen_b_salon.jpg';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

const getStateByCity = (city: string) => {
  const map: Record<string, string> = {
    'Mumbai': 'Maharashtra',
    'Bengaluru': 'Karnataka',
    'Bangalore': 'Karnataka',
    'Jaipur': 'Rajasthan',
    'New Delhi': 'Delhi NCR',
    'Delhi': 'Delhi NCR',
    'Hyderabad': 'Telangana',
    'Chennai': 'Tamil Nadu',
    'Kolkata': 'West Bengal',
    'Pune': 'Maharashtra',
    'Goa': 'Goa',
    'Ahmedabad': 'Gujarat',
    'Noida': 'Uttar Pradesh',
    'Gurgaon': 'Haryana'
  };
  return map[city] || 'India';
};

export const Home: FC<HomeProps> = ({ onNavigate }) => {
  const { demoMode, jwt } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedSubnav, setSelectedSubnav] = useState('All');
  const [favorites, setFavorites] = useState<Record<string | number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bbeauty_favorites');
      return saved ? JSON.parse(saved) : { 1001: true, 1002: false, 1003: true };
    } catch {
      return { 1001: true, 1002: false, 1003: true };
    }
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(8);

  const carouselRef = useRef<HTMLDivElement>(null);

  // Subnav Items as in Dribbble Shot
  const subnavItems = [
    'Hair salon',
    'Nail salon',
    'Barbershop',
    'Skin Care',
    'Brows & Lashes',
    'Massage & Spa',
    'More...'
  ];

  // Exquisite Categories with exact requested image URLs & markup
  const categories = [
    {
      name: "Haircut & Styling",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=85",
      subtitle: "Precision cuts, beard sculpting & high-fashion styling",
    },
    {
      name: "Facial & Spa",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=85",
      subtitle: "Revitalizing gold glow facials & botanical skin care",
    },
    {
      name: "Manicure & Pedicure",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=85",
      subtitle: "Artisanal nail couture, deluxe spa scrubs & polish",
    },
    {
      name: "Massage Therapy",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=85",
      subtitle: "Traditional Ayurvedic therapies & deep muscle relaxation",
    },
  ];

  // Curated Dribbble Featured Salons
  const dribbbleFeaturedSalons = [
    {
      id: 1001,
      name: "Andrew Beauty Spa",
      image: andrewSpaImg,
      tags: ["Massage & Spa", "Haircut"],
      address: "Bandra West, Link Road",
      city: "Mumbai",
      state: "Maharashtra",
      rating: 4.9,
      reviewsCount: 185,
      openTime: "09:00",
      closeTime: "21:00",
      phone: "+91 22 4982 7100"
    },
    {
      id: 1002,
      name: "Alpha beauty",
      image: alphaBeautyImg,
      tags: ["Nail", "Pedicure"],
      address: "100 Feet Road, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      rating: 4.8,
      reviewsCount: 210,
      openTime: "10:00",
      closeTime: "20:30",
      phone: "+91 80 4123 7890"
    },
    {
      id: 1003,
      name: "Queen B Salon",
      image: queenBSalonImg,
      tags: ["Nail", "Haircut"],
      address: "Ashok Marg, C-Scheme",
      city: "Jaipur",
      state: "Rajasthan",
      rating: 4.9,
      reviewsCount: 142,
      openTime: "09:30",
      closeTime: "21:00",
      phone: "+91 141 236 8920"
    }
  ];

  // Load Salons from backend
  const loadSalons = useCallback(async (filterCity = '') => {
    try {
      setLoading(true);
      let endpoint = "/api/salons";
      if (filterCity) {
        endpoint = `/api/salons/search?city=${encodeURIComponent(filterCity)}`;
      }
      const data = await apiRequest(endpoint, { noFailover: true });
      setSalons(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load salons", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalons();
  }, [loadSalons, demoMode, jwt]);

  // Favorite toggle
  const toggleFavorite = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('bbeauty_favorites', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const handleSearch = () => {
    const filter = cityFilter || searchQuery;
    loadSalons(filter);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCityFilter(val);
    loadSalons(val);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleExplore = (salonId: number) => {
    onNavigate('salon-detail', salonId);
  };

  const handleSubnavClick = (item: string) => {
    if (selectedSubnav === item) {
      setSelectedSubnav('All');
      loadSalons(cityFilter);
    } else {
      setSelectedSubnav(item);
      if (item === 'More...') {
        const el = document.getElementById('exquisite-categories-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bbeauty-page">
      {/* =========================================================================
          HERO SECTION ("BeBeauty! Be you")
          ========================================================================= */}
      <section className="bbeauty-hero">
        <div className="bbeauty-hero-container">
          <div className="bbeauty-hero-left">
            <h1 className="bbeauty-hero-title">
              BeBeauty!<br />
              <span>Be you</span>
            </h1>
            <p className="bbeauty-hero-subtitle">
              Because self-love starts with self-care
            </p>

            <div className="bbeauty-search-box">
              <Search size={20} style={{ color: '#ea6a75', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search for our service or salon"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="bbeauty-search-input"
              />
              <select
                value={cityFilter}
                onChange={handleCityChange}
                className="bbeauty-city-select"
                aria-label="Filter city"
              >
                <option value="">All India</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Jaipur">Jaipur</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
              <button className="bbeauty-search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>

          <div className="bbeauty-hero-right">
            <div className="bbeauty-hero-img-card">
              <img
                src={bbeautyHeroImg}
                alt="BeBeauty Radiant Portrait"
              />
              <div className="bbeauty-floating-badge">
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea6a75' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e1e24' }}>Top Rated Self-Care</div>
                  <div style={{ fontSize: '11px', color: '#7a7a85' }}>★ 4.9 · 10,000+ Happy Clients across India</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SUB-NAVIGATION / CATEGORY QUICK FILTERS (Dribbble bar)
          ========================================================================= */}
      <nav className="bbeauty-subnav-bar">
        {subnavItems.map((item) => {
          const isActive = selectedSubnav === item;
          return (
            <button
              key={item}
              className={`bbeauty-subnav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleSubnavClick(item)}
            >
              {item}
            </button>
          );
        })}
      </nav>

      {/* =========================================================================
          "WE OFFER BEST SERVICES" (FEATURED SALON CARDS)
          ========================================================================= */}
      <section className="container" id="bbeauty-salons-section" style={{ paddingTop: '50px', paddingBottom: '30px' }}>
        <div className="bbeauty-section-header">
          <h2 className="bbeauty-section-title">We Offer Best Services</h2>
          <div className="bbeauty-carousel-arrows">
            <button
              className="bbeauty-arrow-btn"
              onClick={() => scrollCarousel('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="bbeauty-arrow-btn"
              onClick={() => scrollCarousel('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Featured Salons Grid (Dribbble cards + Live Database Salons) */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ borderColor: 'rgba(234, 106, 117, 0.2)', borderTopColor: '#ea6a75' }}></div>
          </div>
        )}
        <div className="bbeauty-salon-grid" ref={carouselRef}>
          {/* Card 1: Andrew Beauty Spa */}
          {dribbbleFeaturedSalons.map((item) => {
            const isFav = !!favorites[item.id];
            return (
              <div key={item.id} className="bbeauty-salon-card">
                <div className="bbeauty-card-media">
                  <img src={item.image} alt={item.name} />
                  <button
                    className={`bbeauty-favorite-btn ${isFav ? 'favorited' : ''}`}
                    onClick={(e) => toggleFavorite(item.id, e)}
                    aria-label="Save to favorites"
                  >
                    <Heart size={18} fill={isFav ? '#ea6a75' : 'none'} />
                  </button>
                </div>
                <div className="bbeauty-card-body">
                  <h3 className="bbeauty-card-name">{item.name}</h3>
                  <div className="bbeauty-tag-row">
                    {item.tags.map((t, idx) => (
                      <span key={idx} className="bbeauty-tag">{t}</span>
                    ))}
                  </div>
                  <div className="bbeauty-card-location">
                    <MapPin size={14} style={{ color: '#ea6a75', flexShrink: 0 }} />
                    <span>{item.address}, {item.city} ({item.state})</span>
                  </div>
                  <div className="bbeauty-card-footer">
                    <div className="bbeauty-rating">
                      <Star size={14} fill="#ea6a75" color="#ea6a75" />
                      <span>{item.rating} ({item.reviewsCount})</span>
                    </div>
                    <button
                      className="bbeauty-book-btn"
                      onClick={() => handleExplore(salons[0]?.id || 253)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Database Salons (Luxe Nirvana, Velvet Royale, Urban Crown, Aura Glamour) */}
          {salons.map((salon) => {
            const isFav = !!favorites[salon.id];
            const cover = (salon.images && salon.images[0]) || andrewSpaImg;
            const stateName = salon.state || getStateByCity(salon.city);

            return (
              <div key={salon.id} className="bbeauty-salon-card">
                <div className="bbeauty-card-media">
                  <img src={cover} alt={salon.name} />
                  <button
                    className={`bbeauty-favorite-btn ${isFav ? 'favorited' : ''}`}
                    onClick={(e) => toggleFavorite(salon.id, e)}
                    aria-label="Save to favorites"
                  >
                    <Heart size={18} fill={isFav ? '#ea6a75' : 'none'} />
                  </button>
                </div>
                <div className="bbeauty-card-body">
                  <h3 className="bbeauty-card-name">{salon.name}</h3>
                  <div className="bbeauty-tag-row">
                    <span className="bbeauty-tag">Verified Premier</span>
                    <span className="bbeauty-tag">📍 {stateName}</span>
                  </div>
                  <div className="bbeauty-card-location">
                    <MapPin size={14} style={{ color: '#ea6a75', flexShrink: 0 }} />
                    <span>{salon.address}, {salon.city} &bull; <strong>{stateName}, India</strong></span>
                  </div>
                  <div className="bbeauty-card-footer">
                    <div className="bbeauty-rating">
                      <Star size={14} fill="#ea6a75" color="#ea6a75" />
                      <span>4.9 ({salon.openTime ? String(salon.openTime).slice(0, 5) : '09:00'})</span>
                    </div>
                    <button
                      className="bbeauty-book-btn"
                      onClick={() => handleExplore(salon.id)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          EXQUISITE CATEGORIES SECTION (Requested by User)
          ========================================================================= */}
      <section className="container" id="exquisite-categories-section" style={{ paddingBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <span style={{ color: '#ea6a75', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Exquisite Categories
          </span>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1e1e24', marginTop: '6px' }}>
            Indulge in Care
          </h2>
          <p style={{ color: '#7a7a85', maxWidth: '620px', margin: '8px auto 0', fontSize: '15px' }}>
            Select an exquisite treatment category to discover premier salons and master stylists across India.
          </p>
        </div>

        {/* Featured Category Visual Cards (Using exact user requested markup & styling) */}
        <div className="category-cards-grid">
          {categories.map((category) => {
            const isSelected = activeCategory === category.name;
            return (
              <div
                key={category.name}
                className={`category-feature-card ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveCategory(isSelected ? null : category.name)}
                role="button"
                tabIndex={0}
              >
                <div className="category-img-container">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-56 w-full rounded-2xl object-cover"
                  />
                  <div className="category-overlay">
                    <h3>{category.name}</h3>
                    <p>{category.subtitle}</p>
                    <span className="category-badge">
                      {isSelected ? '✓ Filter Active' : 'Explore Treatments'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeCategory && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
            <span style={{ fontSize: '14px', color: '#7a7a85' }}>
              Filtering by: <strong style={{ color: '#ea6a75' }}>{activeCategory}</strong>
            </span>
            <button
              className="btn btn-outline"
              onClick={() => setActiveCategory(null)}
              style={{ padding: '4px 14px', fontSize: '12px', textTransform: 'none', borderColor: '#ea6a75', color: '#ea6a75' }}
            >
              Show All Salons
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          MOBILE APPOINTMENT BOOKING PREVIEW (Right side of Dribbble Shot)
          ========================================================================= */}
      <section className="container" id="bbeauty-app-section" style={{ paddingBottom: '70px' }}>
        <div className="bbeauty-app-showcase">
          <div>
            <span style={{ color: '#ea6a75', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Digital Platform for Beauty Services
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#1e1e24', margin: '10px 0 16px', lineHeight: 1.15 }}>
              Reserve Your Ritual Anytime, Anywhere
            </h2>
            <p style={{ color: '#686875', fontSize: '16px', lineHeight: 1.6, marginBottom: '25px' }}>
              Experience effortless appointment scheduling. Browse verified beauty studios, select master practitioners, review verified ratings, and pay seamlessly via UPI.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e1e24', fontWeight: 600 }}>
                <CheckCircle2 size={18} style={{ color: '#ea6a75' }} />
                <span>Instant Confirmation & Real-time Reminders</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e1e24', fontWeight: 600 }}>
                <CheckCircle2 size={18} style={{ color: '#ea6a75' }} />
                <span>Verified Cleanliness & Premium Sanitization Standards</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e1e24', fontWeight: 600 }}>
                <CheckCircle2 size={18} style={{ color: '#ea6a75' }} />
                <span>Zero Cancellation Fees up to 2 Hours Before</span>
              </div>
            </div>

            <button
              className="bbeauty-search-btn"
              onClick={() => {
                const el = document.getElementById('bbeauty-salons-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Explore Top Salons</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Interactive Mobile Screen Mockup */}
          <div className="bbeauty-mobile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: '#ea6a75' }} />
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e1e24' }}>My Appointments</span>
              </div>
              <span style={{ fontSize: '12px', color: '#ea6a75', fontWeight: 600 }}>April 2026</span>
            </div>

            {/* Interactive Calendar Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '11px', color: '#8a8a96', marginBottom: '8px' }}>
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="bbeauty-calendar-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((day) => (
                <div
                  key={day}
                  className={`bbeauty-calendar-day ${selectedCalendarDay === day ? 'selected' : ''}`}
                  onClick={() => setSelectedCalendarDay(day)}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Selected Booking Card */}
            <div style={{ background: '#fff5f5', borderRadius: '16px', padding: '16px', border: '1px solid #f8e1e0', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e1e24' }}>Alpha Beauty &bull; Bengaluru</span>
                <span style={{ background: '#ea6a75', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                  Confirmed
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} style={{ color: '#ea6a75' }} />
                <span>April {selectedCalendarDay}, 2026 &bull; 11:30 AM</span>
              </div>
              <div style={{ fontSize: '12px', color: '#1e1e24', fontWeight: 600, marginTop: '8px' }}>
                Deluxe Gel Pedicure & Signature Cut
              </div>
            </div>

            {/* Places Nearby */}
            <div style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e1e24', display: 'block', marginBottom: '10px' }}>
                Places nearby
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fcf8f8', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffdcd7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea6a75', fontWeight: 800 }}>
                    B
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e1e24' }}>Bliss Spa & Lounge</div>
                    <div style={{ fontSize: '11px', color: '#7a7a85' }}>Indiranagar &bull; 4.8 ★</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#27ae60', fontWeight: 700 }}>Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER (BBeauty Signature)
          ========================================================================= */}
      <footer id="bbeauty-footer" style={{ background: '#ffffff', borderTop: '1px solid #f3e5e4', padding: '50px 20px 30px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#1e1e24', letterSpacing: '-0.5px' }}>
                B<span style={{ color: '#ea6a75' }}>Beauty</span>
              </span>
              <span style={{ background: '#fff0f1', color: '#ea6a75', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '12px' }}>
                AURA
              </span>
            </div>
            <p style={{ color: '#7a7a85', fontSize: '14px', lineHeight: 1.6 }}>
              India's premier digital sanctuary for luxury salon appointments and holistic self-care.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e1e24', marginBottom: '16px' }}>Destinations</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#686875', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Mumbai &bull; Maharashtra</li>
              <li>Bengaluru &bull; Karnataka</li>
              <li>Jaipur &bull; Rajasthan</li>
              <li>New Delhi &bull; Delhi NCR</li>
              <li>Hyderabad &bull; Telangana</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e1e24', marginBottom: '16px' }}>Services</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#686875', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Haircut & Haute Styling</li>
              <li>Facials & Botanical Glow</li>
              <li>Manicure & Pedicure Lounge</li>
              <li>Therapeutic Ayurvedic Spa</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e1e24', marginBottom: '16px' }}>Contact & Concierge</h4>
            <p style={{ color: '#686875', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
              Email: <span style={{ color: '#ea6a75', fontWeight: 600 }}>concierge@bbeauty.in</span>
            </p>
            <p style={{ color: '#686875', fontSize: '14px' }}>
              Support: <span style={{ color: '#1e1e24', fontWeight: 600 }}>+91 80 4123 7890</span>
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1240px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid #f6dedc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '13px', color: '#9a9aa5' }}>
          <div>&copy; 2026 BBeauty Platform. All rights reserved.</div>
          <div>Because self-love starts with self-care.</div>
        </div>
      </footer>
    </div>
  );
};
