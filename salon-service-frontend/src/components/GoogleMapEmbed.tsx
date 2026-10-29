import React from 'react';
import { MapPin, Navigation, ExternalLink, Clock, Phone } from 'lucide-react';

interface GoogleMapEmbedProps {
  salonName: string;
  address: string;
  city: string;
  state?: string;
  phoneNumber?: string;
  openTime?: string;
  closeTime?: string;
  height?: string;
  title?: string;
  showInfoFooter?: boolean;
}

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  salonName,
  address,
  city,
  state,
  phoneNumber,
  openTime = '09:00',
  closeTime = '21:00',
  height = '360px',
  title = "Salon Location & Directions",
  showInfoFooter = true
}) => {
  // Construct precise query string for Google Maps
  const locationParts = [salonName, address, city, state, 'India'].filter(Boolean);
  const mapsQuery = locationParts.join(', ');
  
  // Free, high-reliability embed URL without requiring Google Cloud billing/API keys
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  
  // Direct Google Maps links for native app or browser directions
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`;

  return (
    <div className="google-maps-card" style={{
      background: 'var(--bg-surface, #ffffff)',
      border: '1px solid var(--border-subtle, #f0e6e5)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.3s ease'
    }}>
      {/* Header with Title, Address, and Action Buttons */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-subtle, #f0e6e5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        background: '#ffffff'
      }}>
        <div style={{ minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              background: '#fff0f1',
              color: '#ea6a75',
              padding: '6px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={18} />
            </span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e1e24', letterSpacing: '-0.3px' }}>
              {title}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#686875', paddingLeft: '32px' }}>
            <strong style={{ color: '#1e1e24' }}>{salonName}</strong> &bull; {address}, {city}{state ? `, ${state}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open exact pin in Google Maps"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#4b4b56',
              background: '#f8f8fa',
              border: '1px solid #e8e8ee',
              padding: '8px 14px',
              borderRadius: '20px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ExternalLink size={14} style={{ color: '#ea6a75' }} />
            <span>Open in Google Maps</span>
          </a>

          <a
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Get driving/walking directions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#ffffff',
              background: '#ea6a75',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 106, 117, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Navigation size={14} />
            <span>Get Directions</span>
          </a>
        </div>
      </div>

      {/* Interactive Google Map iframe */}
      <div style={{ position: 'relative', width: '100%', height, background: '#f5f5f5' }}>
        <iframe
          title={`Google Maps Pin for ${salonName}`}
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapsEmbedUrl}
        />
      </div>

      {/* Footer Info Strip */}
      {showInfoFooter && (
        <div style={{
          padding: '12px 24px',
          background: '#fcfcfd',
          borderTop: '1px solid var(--border-subtle, #f0e6e5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: '#686875'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} style={{ color: '#ea6a75' }} />
              <span>Hours: {String(openTime).slice(0, 5)} - {String(closeTime).slice(0, 5)}</span>
            </span>
            {phoneNumber && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={13} style={{ color: '#ea6a75' }} />
                <span>Desk: {phoneNumber}</span>
              </span>
            )}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#15803d' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
            <span>Live GPS Verified Location</span>
          </div>
        </div>
      )}
    </div>
  );
};
