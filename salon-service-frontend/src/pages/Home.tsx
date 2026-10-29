import { useState, useEffect, useCallback, useRef, type FC } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Salon } from '../services/mockApi';
import { GoogleMapEmbed } from '../components/GoogleMapEmbed';
import { 
  Search, 
  MapPin, 
  Heart, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  Mic, 
  SlidersHorizontal,
  Home as HomeIcon,
  FileText,
  User as UserIcon
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
  const [selectedMapCity, setSelectedMapCity] = useState("Mumbai");

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

  // Verified Salon Locations for Interactive Google Maps Hub
  const mapLocations = [
    {
      city: "Mumbai",
      state: "Maharashtra",
      name: "Andrew Beauty Spa",
      address: "Bandra West, Link Road",
      phone: "+91 22 4982 7100",
      openTime: "09:00",
      closeTime: "21:00"
    },
    {
      city: "Bengaluru",
      state: "Karnataka",
      name: "Alpha beauty / Luxe Nirvana Lounge",
      address: "100 Feet Road, Indiranagar",
      phone: "+91 80 4123 7890",
      openTime: "10:00",
      closeTime: "20:30"
    },
    {
      city: "Jaipur",
      state: "Rajasthan",
      name: "Queen B Salon / Velvet Royale Studio",
      address: "Ashok Marg, C-Scheme",
      phone: "+91 141 236 8920",
      openTime: "09:30",
      closeTime: "21:00"
    },
    {
      city: "New Delhi",
      state: "Delhi NCR",
      name: "Urban Crown Hair Studio",
      address: "Inner Circle, Connaught Place",
      phone: "+91 11 4872 3100",
      openTime: "10:00",
      closeTime: "21:00"
    },
    {
      city: "Hyderabad",
      state: "Telangana",
      name: "Aura Glamour Sanctuary",
      address: "Road No. 36, Jubilee Hills",
      phone: "+91 40 2355 9840",
      openTime: "09:30",
      closeTime: "21:30"
    }
  ];

  const activeMapLocation = mapLocations.find(l => l.city === selectedMapCity) || mapLocations[0];

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
              className="bbeauty-arrow-btn-left"
              onClick={() => scrollCarousel('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="bbeauty-arrow-btn-right"
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
          {/* Dribbble Curated Salons */}
          {dribbbleFeaturedSalons.map((item) => {
            const isFav = !!favorites[item.id];
            const mapsQuery = [item.name, item.address, item.city, item.state, 'India'].filter(Boolean).join(', ');
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

            return (
              <div key={item.id} className="bbeauty-salon-card">
                <div className="bbeauty-card-media">
                  <img src={item.image} alt={item.name} />
                  <button
                    className={`bbeauty-favorite-btn ${isFav ? 'favorited' : ''}`}
                    onClick={(e) => toggleFavorite(item.id, e)}
                    aria-label="Save to favorites"
                  >
                    <Heart size={16} fill={isFav ? '#ffffff' : 'none'} color="#ffffff" />
                  </button>
                </div>
                <div className="bbeauty-card-body">
                  <h3 className="bbeauty-card-name">{item.name}</h3>
                  <div className="bbeauty-tag-row">
                    {item.tags.map((t, idx) => (
                      <span key={idx} className="bbeauty-tag">
                        <Sparkles size={11} />
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="bbeauty-card-location">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#4b4b56' }}>{item.city}, {item.state}</div>
                        <div style={{ color: '#8a8a96', fontSize: '11px', marginTop: '2px' }}>{item.address}</div>
                      </div>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View exact location on Google Maps"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#ea6a75',
                          background: '#fff0f1',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          flexShrink: 0
                        }}
                      >
                        <MapPin size={11} />
                        <span>Maps ↗</span>
                      </a>
                    </div>
                  </div>
                  <div className="bbeauty-card-footer">
                    <div className="bbeauty-rating">
                      <Star size={13} fill="#ea6a75" color="#ea6a75" />
                      <span>{item.rating}</span>
                      <span>({item.reviewsCount})</span>
                    </div>
                    <button
                      className="bbeauty-book-btn"
                      onClick={() => handleExplore(item.id)}
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
            const mapsQuery = [salon.name, salon.address, salon.city, stateName, 'India'].filter(Boolean).join(', ');
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

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
                  <div className="bbeauty-card-location" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <MapPin size={14} style={{ color: '#ea6a75', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {salon.address}, {salon.city} &bull; <strong>{stateName}</strong>
                      </span>
                    </div>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View exact location on Google Maps"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#ea6a75',
                        background: '#fff0f1',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        flexShrink: 0,
                        marginLeft: '6px'
                      }}
                    >
                      <MapPin size={11} />
                      <span>Maps ↗</span>
                    </a>
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
          INTERACTIVE GOOGLE MAPS SECTION (Exact Locations Across India)
          ========================================================================= */}
      <section className="container" id="google-maps-hubs-section" style={{ paddingBottom: '70px' }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <span style={{ color: '#ea6a75', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Live Navigation &bull; Google Maps
          </span>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1e1e24', marginTop: '6px' }}>
            Locate Luxury Salons Near You
          </h2>
          <p style={{ color: '#7a7a85', maxWidth: '620px', margin: '8px auto 0', fontSize: '15px' }}>
            View exact street coordinates, get turn-by-turn driving directions, and explore our premier beauty sanctuaries across India.
          </p>
        </div>

        {/* City Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
          {mapLocations.map((loc) => {
            const isSelected = selectedMapCity === loc.city;
            return (
              <button
                key={loc.city}
                onClick={() => setSelectedMapCity(loc.city)}
                style={{
                  background: isSelected ? '#ea6a75' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#4b4b56',
                  border: isSelected ? '1px solid #ea6a75' : '1px solid #e8e8ee',
                  borderRadius: '24px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 14px rgba(234, 106, 117, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                <MapPin size={13} style={{ color: isSelected ? '#ffffff' : '#ea6a75' }} />
                <span>{loc.city} ({loc.state})</span>
              </button>
            );
          })}
        </div>

        {/* Active Map Card */}
        {activeMapLocation && (
          <GoogleMapEmbed
            salonName={activeMapLocation.name}
            address={activeMapLocation.address}
            city={activeMapLocation.city}
            state={activeMapLocation.state}
            phoneNumber={activeMapLocation.phone}
            openTime={activeMapLocation.openTime}
            closeTime={activeMapLocation.closeTime}
            height="420px"
            title={`${activeMapLocation.name} — Exact Google Maps Location`}
          />
        )}
      </section>

      {/* =========================================================================
          BBEAUTY MOBILE PLATFORM SHOWCASE (Right side of Dribbble Shot)
          ========================================================================= */}
      <section className="container" id="bbeauty-app-section" style={{ paddingBottom: '70px' }}>
        <div className="bbeauty-canvas-wrapper">
          <div className="bbeauty-canvas-header">
            <span className="badge-pill">Digital Platform for Beauty Services</span>
            <h2>Book On The Go &bull; Mobile Experience</h2>
            <p>
              Experience seamless salon discovery, real-time appointments, and effortless booking across India right in the palm of your hand.
            </p>
          </div>

          <div className="bbeauty-mobile-grid">
            {/* Phone 1: Search & Filter (Nail Salon) */}
            <div className="bbeauty-phone-frame">
              <div className="bbeauty-phone-notch" />
              <div className="bbeauty-phone-status-bar">
                <span>9:41</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Sparkles size={11} color="#ea6a75" />
                  <span>5G</span>
                </div>
              </div>
              <div className="bbeauty-phone-body">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <ChevronLeft size={16} />
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>Nail salon</span>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8f8fa', borderRadius: '16px', padding: '6px 12px', gap: '8px', marginBottom: '10px', border: '1px solid #eee' }}>
                  <Search size={14} color="#ea6a75" />
                  <input type="text" placeholder="Search" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%' }} readOnly value="Nail Art &amp; Spa" />
                  <Mic size={14} color="#8a8a96" />
                </div>

                {/* Chips */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ background: '#fff0f1', color: '#ea6a75', fontSize: '10px', fontWeight: 600, padding: '4px 8px', borderRadius: '12px' }}>📍 Near You</span>
                  <span style={{ background: '#f8f8fa', color: '#686875', fontSize: '10px', fontWeight: 600, padding: '4px 8px', borderRadius: '12px' }}>📅 When?</span>
                </div>

                {/* Filter and Sort row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#686875', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><SlidersHorizontal size={12} /> Filters</span>
                  <span>Sort by recommended ⌵</span>
                </div>

                {/* Salons list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '10px', border: '1px solid #f2e2e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e1e24' }}>Alpha Beauty</div>
                        <div style={{ fontSize: '10px', color: '#8a8a96' }}>Bengaluru &bull; Indiranagar</div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                          <span style={{ fontSize: '9px', background: '#fff0f1', color: '#ea6a75', padding: '2px 5px', borderRadius: '4px' }}>Nail salon</span>
                          <span style={{ fontSize: '9px', background: '#fff0f1', color: '#ea6a75', padding: '2px 5px', borderRadius: '4px' }}>Pedicure</span>
                        </div>
                      </div>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ffd5d1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={11} fill="#ffffff" color="#ffffff" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#ea6a75', fontWeight: 700 }}>★★★★★ (351)</span>
                      <button onClick={() => handleExplore(1002)} style={{ background: '#ea6a75', color: '#fff', border: 'none', borderRadius: '10px', padding: '3px 8px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}>Book Now</button>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '10px', border: '1px solid #f2e2e0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e1e24' }}>Queen B Salon</div>
                        <div style={{ fontSize: '10px', color: '#8a8a96' }}>Jaipur &bull; C-Scheme</div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                          <span style={{ fontSize: '9px', background: '#fff0f1', color: '#ea6a75', padding: '2px 5px', borderRadius: '4px' }}>Nail salon</span>
                        </div>
                      </div>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ffd5d1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={11} fill="#ffffff" color="#ffffff" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#ea6a75', fontWeight: 700 }}>★★★★☆ (128)</span>
                      <button onClick={() => handleExplore(1003)} style={{ background: '#ea6a75', color: '#fff', border: 'none', borderRadius: '10px', padding: '3px 8px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}>Book Now</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bbeauty-phone-bottom-nav">
                <HomeIcon size={16} />
                <Search size={16} style={{ color: '#ea6a75' }} />
                <Calendar size={16} />
                <FileText size={16} />
                <UserIcon size={16} />
              </div>
            </div>

            {/* Phone 2: Discover Home (Welcome Leslie!) */}
            <div className="bbeauty-phone-frame">
              <div className="bbeauty-phone-notch" />
              <div className="bbeauty-phone-status-bar">
                <span>9:41</span>
                <span>BBeauty</span>
              </div>
              <div className="bbeauty-phone-body">
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8f8fa', borderRadius: '16px', padding: '6px 12px', gap: '8px', marginBottom: '12px' }}>
                  <Search size={14} color="#ea6a75" />
                  <span style={{ fontSize: '11px', color: '#8a8a96' }}>Search for service or salon...</span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1e1e24', marginBottom: '10px' }}>
                  Welcome Leslie!
                </div>

                {/* Categories */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '14px' }}>
                  {['Hair', 'Nails', 'Spa', 'Skin'].map((c, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea6a75', fontSize: '11px', fontWeight: 700 }}>
                        {c[0]}
                      </div>
                      <span style={{ fontSize: '10px', color: '#4b4b56' }}>{c}</span>
                    </div>
                  ))}
                </div>

                {/* Popular */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1e24', marginBottom: '6px' }}>Popular</div>
                  <div style={{ background: '#fff9f8', borderRadius: '12px', padding: '8px 10px', border: '1px solid #f6dedc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '11px', color: '#1e1e24' }}>Queen B Salon</div>
                      <div style={{ fontSize: '10px', color: '#ea6a75' }}>★★★★★ (128)</div>
                    </div>
                    <button onClick={() => handleExplore(1003)} style={{ background: '#fff', border: '1px solid #ea6a75', color: '#ea6a75', borderRadius: '10px', padding: '2px 8px', fontSize: '9px', fontWeight: 600, cursor: 'pointer' }}>View more</button>
                  </div>
                </div>

                {/* Places nearby */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1e24', marginBottom: '6px' }}>Places nearby</div>
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '8px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={andrewSpaImg} alt="Andrew Spa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '11px', color: '#1e1e24' }}>Andrew Beauty Spa</div>
                      <div style={{ fontSize: '10px', color: '#8a8a96' }}>Bandra West, Mumbai</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bbeauty-phone-bottom-nav">
                <HomeIcon size={16} style={{ color: '#ea6a75' }} />
                <Search size={16} />
                <Calendar size={16} />
                <FileText size={16} />
                <UserIcon size={16} />
              </div>
            </div>

            {/* Phone 3: Calendar / Slot selection */}
            <div className="bbeauty-phone-frame">
              <div className="bbeauty-phone-notch" />
              <div className="bbeauty-phone-status-bar">
                <span>9:41</span>
                <span>Appointment</span>
              </div>
              <div className="bbeauty-phone-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <ChevronLeft size={16} />
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>Book Treatment</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', fontWeight: 700 }}>
                  <span>November 2026</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <ChevronLeft size={14} />
                    <ChevronRight size={14} />
                  </div>
                </div>

                {/* Calendar strip */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', marginBottom: '14px' }}>
                  {[
                    { day: 'Mo', d: 7 },
                    { day: 'Tu', d: 8 },
                    { day: 'We', d: 9 },
                    { day: 'Th', d: 10 },
                    { day: 'Fr', d: 11 },
                  ].map((item) => {
                    const isSelected = selectedCalendarDay === item.d;
                    return (
                      <div
                        key={item.d}
                        onClick={() => setSelectedCalendarDay(item.d)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          textAlign: 'center',
                          borderRadius: '12px',
                          background: isSelected ? '#ea6a75' : '#f8f8fa',
                          color: isSelected ? '#ffffff' : '#4b4b56',
                          cursor: 'pointer',
                          border: isSelected ? '1px solid #ea6a75' : '1px solid #eee'
                        }}
                      >
                        <div style={{ fontSize: '9px' }}>{item.day}</div>
                        <div style={{ fontSize: '12px', fontWeight: 800 }}>{item.d}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Available times */}
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1e24', marginBottom: '6px' }}>Available hours</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px' }}>
                  {['09:00', '10:30', '12:00', '14:30', '16:00', '18:30'].map((time, idx) => (
                    <div
                      key={time}
                      style={{
                        padding: '6px 4px',
                        textAlign: 'center',
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        background: idx === 1 ? '#fff0f1' : '#f8f8fa',
                        color: idx === 1 ? '#ea6a75' : '#4b4b56',
                        border: idx === 1 ? '1px solid #ea6a75' : '1px solid #eee'
                      }}
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {/* Master stylist selection */}
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1e24', marginBottom: '6px' }}>Specialist</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8f8fa', padding: '8px', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ffd5d1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#ea6a75' }}>
                    PK
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e1e24' }}>Pooja Kapoor</div>
                    <div style={{ fontSize: '9px', color: '#8a8a96' }}>Senior Hair &amp; Glow Stylist</div>
                  </div>
                </div>

                <button
                  onClick={() => handleExplore(1001)}
                  style={{ marginTop: 'auto', background: '#ea6a75', color: '#fff', border: 'none', borderRadius: '12px', padding: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'center', width: '100%' }}
                >
                  Confirm Slot
                </button>
              </div>
              <div className="bbeauty-phone-bottom-nav">
                <HomeIcon size={16} />
                <Search size={16} />
                <Calendar size={16} style={{ color: '#ea6a75' }} />
                <FileText size={16} />
                <UserIcon size={16} />
              </div>
            </div>

            {/* Phone 4: Alpha Beauty Detail */}
            <div className="bbeauty-phone-frame">
              <div className="bbeauty-phone-notch" />
              <div className="bbeauty-phone-status-bar">
                <span>9:41</span>
                <span>Studio Details</span>
              </div>
              <div className="bbeauty-phone-body">
                <div style={{ height: '90px', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
                  <img src={alphaBeautyImg} alt="Alpha Beauty" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e1e24' }}>Alpha beauty</div>
                <div style={{ fontSize: '10px', color: '#7a7a85', margin: '2px 0 4px' }}>100 Feet Road, Indiranagar, Bengaluru</div>
                <div style={{ fontSize: '10px', color: '#ea6a75', fontWeight: 700, marginBottom: '6px' }}>★★★★★ 4.8 (210 reviews)</div>
                <p style={{ fontSize: '10px', color: '#686875', lineHeight: 1.4, marginBottom: '8px' }}>
                  Premier sanctuary for haute hair artistry, revitalizing skin facials, and luxury nail couture with certified stylists.
                </p>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e1e24', marginBottom: '4px' }}>List of services</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', color: '#4b4b56' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Signature Haircut</span>
                    <span style={{ fontWeight: 700, color: '#ea6a75' }}>₹650</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gel Manicure &amp; Pedicure</span>
                    <span style={{ fontWeight: 700, color: '#ea6a75' }}>₹950</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Radiant Skin Cleansing</span>
                    <span style={{ fontWeight: 700, color: '#ea6a75' }}>₹1,400</span>
                  </div>
                </div>
                <button
                  onClick={() => handleExplore(1002)}
                  style={{ marginTop: 'auto', background: '#ea6a75', color: '#fff', border: 'none', borderRadius: '12px', padding: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'center', width: '100%' }}
                >
                  Book Appointment
                </button>
              </div>
              <div className="bbeauty-phone-bottom-nav">
                <HomeIcon size={16} />
                <Search size={16} />
                <Calendar size={16} />
                <FileText size={16} />
                <UserIcon size={16} style={{ color: '#ea6a75' }} />
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
