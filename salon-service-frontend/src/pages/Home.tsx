import { useState, useEffect, useCallback, type FC } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Salon } from '../services/mockApi';
import { SalonCard } from '../components/SalonCard';
import { Search, MapPin, Scissors } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Home: FC<HomeProps> = ({ onNavigate }) => {
  const { demoMode, jwt } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
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

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Load Salons
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

  return (
    <div>
      <section className="hero">
        <h1 className="playfair">Aura & Elegance</h1>
        <p>Discover and book top-tier grooming and self-care treatments in premier salons across India.</p>
        <div className="search-container">
          <div className="search-input-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search salons by name, city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <div className="search-select-group">
            <MapPin size={18} className="gold-text" />
            <select value={cityFilter} onChange={handleCityChange}>
              <option value="">All Cities & States</option>
              <option value="Mumbai">Mumbai (Maharashtra)</option>
              <option value="Bengaluru">Bengaluru (Karnataka)</option>
              <option value="Jaipur">Jaipur (Rajasthan)</option>
              <option value="New Delhi">New Delhi (Delhi NCR)</option>
              <option value="Hyderabad">Hyderabad (Telangana)</option>
              <option value="Pune">Pune (Maharashtra)</option>
              <option value="Chennai">Chennai (Tamil Nadu)</option>
              <option value="Kolkata">Kolkata (West Bengal)</option>
              <option value="Ahmedabad">Ahmedabad (Gujarat)</option>
              <option value="Goa">Goa</option>
            </select>
          </div>
          <button className="btn btn-gold" onClick={handleSearch}>Search</button>
        </div>
      </section>

      <section className="container">
        <div className="text-center">
          <span className="section-subtitle">Exquisite Categories</span>
          <h2 className="section-title">Indulge in Care</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto 28px', fontSize: '15px' }}>
            Select an exquisite treatment category to discover premier salons and specialized master stylists across India.
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Filtering by: <strong style={{ color: 'var(--gold-primary)' }}>{activeCategory}</strong>
            </span>
            <button
              className="btn btn-outline"
              onClick={() => setActiveCategory(null)}
              style={{ padding: '4px 14px', fontSize: '12px', textTransform: 'none' }}
            >
              Show All Salons
            </button>
          </div>
        )}

        <div className="text-center mt-4">
          <span className="section-subtitle">Featured Destinations</span>
          <h2 className="section-title">Premier Salons</h2>
        </div>

        {loading ? (
          <div className="spinner" style={{ margin: '40px auto' }}></div>
        ) : salons.length === 0 ? (
          <div className="empty-state w-full" style={{ gridColumn: '1 / -1', margin: '40px auto' }}>
            <Scissors size={40} className="gold-text" style={{ marginBottom: '10px' }} />
            <h3>No Salons Found</h3>
            <p>Try searching for a different city, or explore our services.</p>
          </div>
        ) : (
          <div className="salon-grid">
            {salons
              // If category filter is active, we filter salons that might match (normally mock matches everything or filters mock catalog)
              .map((salon) => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  onExplore={handleExplore}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
};
