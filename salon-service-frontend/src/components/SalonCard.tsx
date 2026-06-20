import type { FC } from 'react';
import type { Salon } from '../services/mockApi';
import { Star, MapPin, Phone, Clock } from 'lucide-react';

interface SalonCardProps {
  salon: Salon;
  onExplore: (id: number) => void;
}

export const SalonCard: FC<SalonCardProps> = ({ salon, onExplore }) => {
  const image = salon.images && salon.images.length > 0 
    ? salon.images[0] 
    : "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600";

  return (
    <div className="salon-card">
      <div className="salon-card-image">
        <img src={image} alt={salon.name} />
        <div className="salon-rating-tag">
          <Star size={12} fill="currentColor" />
          <span>4.8</span>
        </div>
      </div>
      <div className="salon-card-content">
        <h3>{salon.name}</h3>
        <div className="salon-card-info">
          <MapPin size={14} />
          <span>{salon.address}, {salon.city} ({salon.state})</span>
        </div>
        <div className="salon-card-info">
          <Phone size={14} />
          <span>{salon.phoneNumber}</span>
        </div>
        <div className="salon-card-footer">
          <span className="salon-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            <span>{salon.openTime || '09:00'} - {salon.closeTime || '21:00'}</span>
          </span>
          <button className="btn btn-outline" onClick={() => onExplore(salon.id)}>
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};
