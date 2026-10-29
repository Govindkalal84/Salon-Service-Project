import type { FC } from 'react';
import type { Salon } from '../services/mockApi';
import { Star, MapPin, Phone, Clock, ExternalLink } from 'lucide-react';

interface SalonCardProps {
  salon: Salon;
  onExplore: (id: number) => void;
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

export const SalonCard: FC<SalonCardProps> = ({ salon, onExplore }) => {
  const image = salon.images && salon.images.length > 0 
    ? salon.images[0] 
    : "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600";

  const stateName = salon.state || getStateByCity(salon.city);
  const mapsQuery = [salon.name, salon.address, salon.city, stateName, 'India'].filter(Boolean).join(', ');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  return (
    <div className="salon-card">
      <div className="salon-card-image">
        <img src={image} alt={salon.name} />
        <div className="salon-rating-tag">
          <Star size={12} fill="currentColor" />
          <span>4.9</span>
        </div>
        <div className="salon-state-badge">
          <span>📍 {stateName}</span>
        </div>
      </div>
      <div className="salon-card-content">
        <h3>{salon.name}</h3>
        <div className="salon-card-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <MapPin size={14} className="gold-text" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {salon.address}, {salon.city} &bull; <strong style={{ color: 'var(--gold-primary)' }}>{stateName}</strong>
            </span>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open exact location in Google Maps"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#ea6a75',
              background: '#fff0f1',
              padding: '2px 8px',
              borderRadius: '12px',
              textDecoration: 'none',
              flexShrink: 0
            }}
          >
            <span>Maps</span>
            <ExternalLink size={10} />
          </a>
        </div>
        <div className="salon-card-info">
          <Phone size={14} />
          <span>{salon.phoneNumber}</span>
        </div>
        <div className="salon-card-footer">
          <span className="salon-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            <span>{salon.openTime ? String(salon.openTime).slice(0, 5) : '09:00'} - {salon.closeTime ? String(salon.closeTime).slice(0, 5) : '21:00'}</span>
          </span>
          <button className="btn btn-outline" onClick={() => onExplore(salon.id)}>
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};
