import { useState, useEffect, useCallback, type FC } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Salon, Category } from '../services/mockApi';
import { SalonCard } from '../components/SalonCard';
import { Search, MapPin, Scissors } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Home: FC<HomeProps> = ({ onNavigate }) => {
  const { demoMode, jwt } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Load Categories
  const loadCategories = useCallback(async () => {
    try {
      // Fetch categories. In mock mode, defaults will load. Pass noFailover to fail silently.
      const rawCategories = await apiRequest("/api/categories/salon/1", { noFailover: true }).catch(() => []);
      
      const defaultCats: Category[] = [
        { id: 1, name: "Haircut & Styling", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&q=80" },
        { id: 2, name: "Facial & Spa", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&q=80" },
        { id: 3, name: "Manicure & Pedicure", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&q=80" },
        { id: 4, name: "Massage Therapy", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=150&q=80" }
      ];
      
      setCategories(rawCategories.length > 0 ? rawCategories : defaultCats);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  }, []);

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
    loadCategories();
    loadSalons();
  }, [loadCategories, loadSalons, demoMode, jwt]);

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
              placeholder="Search salons by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <div className="search-select-group">
            <MapPin size={18} className="gold-text" />
            <select value={cityFilter} onChange={handleCityChange}>
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Pune">Pune</option>
              <option value="Delhi">Delhi</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Noida">Noida</option>
              <option value="Gurgaon">Gurgaon</option>
            </select>
          </div>
          <button className="btn btn-gold" onClick={handleSearch}>Search</button>
        </div>
      </section>

      <section className="container">
        <div className="text-center">
          <span className="section-subtitle">Exquisite Categories</span>
          <h2 className="section-title">Indulge in Care</h2>
        </div>

        <div className="category-row">
          <div
            className={`category-chip ${activeCategory === null ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            <span>All Services</span>
          </div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <img src={cat.image} alt={cat.name} />
              <span>{cat.name}</span>
            </div>
          ))}
        </div>

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
