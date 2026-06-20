import { useState, useEffect, useCallback, type FC } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Salon, Service } from '../services/mockApi';
import { ReviewSection } from '../components/ReviewSection';
import { UPIQrPayment } from '../components/UPIQrPayment';
import { Clock, MapPin, Phone, Star, Calendar, ArrowRight, X } from 'lucide-react';

interface SalonDetailProps {
  salonId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const SalonDetail: FC<SalonDetailProps> = ({ salonId, onNavigate }) => {
  const { user, showToast } = useAuth();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking Flow states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  
  // Payment states
  const [paymentStep, setPaymentStep] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<{ id: number; paymentLinkId: string } | null>(null);
  
  // Review Modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewsRefreshFlag, setReviewsRefreshFlag] = useState(false);

  // Initial load
  const loadSalonDetails = useCallback(async () => {
    try {
      setLoading(true);
      const salonData = await apiRequest(`/api/salons/${salonId}`);
      setSalon(salonData);
      
      const servicesData = await apiRequest(`/api/service-offering/salon/${salonId}`).catch(() => []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (e) {
      console.error("Failed to load salon details", e);
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    loadSalonDetails();
  }, [loadSalonDetails]);

  // Handle service selection toggles
  const handleToggleService = (serviceId: number) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const totalPrice = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  // Trigger Booking flow
  const handleOpenBooking = () => {
    if (!user) {
      showToast("Please log in to book an appointment", "warning");
      onNavigate('auth');
      return;
    }
    
    // Set default date as tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomStr = tomorrow.toISOString().split('T')[0];
    setSelectedDate(tomStr);
    setSelectedSlot('');
    setPaymentStep(false);
    setCreatedBooking(null);
    setBookingModalOpen(true);
  };

  // Fetch slots whenever date changes
  const fetchAvailableSlots = useCallback(async (date: string) => {
    if (!date || !salon) return;
    try {
      setCheckingSlots(true);
      // Fetch bookings for this date and salon
      const bookingsOnDate = await apiRequest(`/api/bookings/slots/salon/${salon.id}/date/${date}`);
      
      // Compute mock standard slots from salon hours
      const slotsList = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"];
      
      // Filter out slots that are already occupied
      const occupiedSlots = bookingsOnDate.map((b: any) => {
        const timePart = b.startTime.split('T')[1];
        return timePart ? timePart.substring(0, 5) : '';
      });
      
      const available = slotsList.filter(slot => !occupiedSlots.includes(slot));
      setAvailableSlots(available);
    } catch (e) {
      console.error("Failed to fetch slots", e);
    } finally {
      setCheckingSlots(false);
    }
  }, [salon]);

  useEffect(() => {
    if (selectedDate && bookingModalOpen) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, bookingModalOpen, fetchAvailableSlots]);

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedSlot || !salon) return;
    
    const startTime = `${selectedDate}T${selectedSlot}:00`;
    // calculate custom end time based on durations
    const totalDuration = services
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.duration, 0);
      
    const startDateObj = new Date(startTime);
    const endDateObj = new Date(startDateObj.getTime() + totalDuration * 60000);
    const endTime = endDateObj.toISOString().split('.')[0];
    
    try {
      // Initiate booking creation (sets status to PENDING)
      const data = await apiRequest(`/api/bookings?salonId=${salon.id}&paymentMethod=RAZORPAY`, {
        method: "POST",
        body: {
          startTime,
          endTime,
          serviceIds: selectedServices
        }
      });
      
      // Extract booking ID from payment link
      // Format: http://localhost:3000/#payment_link_{bookingId}
      const bookingIdMatch = data.payment_link_url.match(/payment_link_(\d+)/);
      const bookingId = bookingIdMatch ? parseInt(bookingIdMatch[1]) : Date.now();
      
      setCreatedBooking({
        id: bookingId,
        paymentLinkId: data.getPayment_link_id
      });
      setPaymentStep(true);
      
    } catch (e: any) {
      showToast(e.message || "Failed to create booking request", "danger");
    }
  };

  // Submit User Review
  const handleSubmitReview = async () => {
    if (!reviewText) return;
    try {
      await apiRequest(`/api/reviews/salon${salonId}`, {
        method: "POST",
        body: {
          rating: reviewRating,
          reviewText: reviewText
        }
      });
      showToast("Review posted. Thank you!", "success");
      setReviewText('');
      setReviewModalOpen(false);
      setReviewsRefreshFlag(prev => !prev);
    } catch (e: any) {
      showToast(e.message || "Failed to post review", "danger");
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Curating your experience...</p>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="container text-center">
        <p className="text-danger">Salon details could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="salon-banner">
        <img src={salon.images[0]} alt={salon.name} />
        <div className="salon-banner-overlay">
          <div className="salon-header-info">
            <span className="user-role-badge">Premium Care</span>
            <h1 className="playfair">{salon.name}</h1>
            <div className="rating-display" id="salon-header-stars">
              <Star size={16} fill="currentColor" className="gold-text" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              <span>4.8 (Based on guest reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container salon-layout">
        <div className="services-area">
          <h2 className="playfair mb-4 gold-text" style={{ fontSize: '28px' }}>Treatment Menu</h2>

          <div className="services-list">
            {services.length === 0 ? (
              <div className="empty-state">
                <p>No treatments listed at the moment.</p>
              </div>
            ) : (
              services.map(service => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <div
                    key={service.id}
                    className="service-card"
                    style={{
                      borderColor: isSelected ? 'var(--gold-primary)' : 'var(--border-subtle)',
                      boxShadow: isSelected ? '0 0 10px rgba(212, 175, 55, 0.1)' : 'none'
                    }}
                  >
                    <div className="service-card-info">
                      <h4>{service.name}</h4>
                      <p>{service.description}</p>
                      <div className="service-meta">
                        <span><Clock size={12} /> {service.duration} mins</span>
                      </div>
                    </div>
                    <div className="service-card-action">
                      <span className="service-price">₹{service.price}</span>
                      <button
                        className={`btn ${isSelected ? 'btn-gold' : 'btn-outline'}`}
                        onClick={() => handleToggleService(service.id)}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <ReviewSection
            salonId={salon.id}
            triggerRefreshFlag={reviewsRefreshFlag}
            onOpenReviewModal={() => setReviewModalOpen(true)}
          />
        </div>

        {/* Reservation Sidebar Panel */}
        <div className="sidebar-panel">
          <h3>Reservation Summary</h3>
          <div className="info-item">
            <MapPin size={16} />
            <span>{salon.address}, {salon.city} ({salon.state})</span>
          </div>
          <div className="info-item">
            <Clock size={16} />
            <span>Hours: {salon.openTime || '09:00'} - {salon.closeTime || '21:00'}</span>
          </div>
          <div className="info-item">
            <Phone size={16} />
            <span>Call: {salon.phoneNumber}</span>
          </div>

          <hr style={{ border: 0, height: '1px', background: 'var(--border-subtle)', margin: '20px 0' }} />

          <div className="booking-summary-details">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Selected Treatments: <span className="gold-text" style={{ fontWeight: 700 }}>{selectedServices.length}</span>
            </p>
            <div id="summary-price-container" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              <span>Total Price:</span>
              <span className="gold-text">₹{totalPrice}</span>
            </div>
            <button
              className="btn btn-gold w-full"
              disabled={selectedServices.length === 0}
              onClick={handleOpenBooking}
            >
              Book Reservation
            </button>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {bookingModalOpen && (
        <div id="booking-modal" className="modal show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-overlay" onClick={() => !paymentStep && setBookingModalOpen(false)}></div>
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', padding: '30px', borderRadius: 'var(--border-radius-lg)', position: 'relative' }}>
            {!paymentStep && (
              <button className="modal-close" onClick={() => setBookingModalOpen(false)}>
                <X size={18} />
              </button>
            )}

            {!paymentStep ? (
              <div className="booking-form-step">
                <h3 className="gold-text playfair" style={{ fontSize: '24px', marginBottom: '10px' }}>Select Slot</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Please choose a convenient date and time slot for your treatments.
                </p>

                <div className="form-group">
                  <label>Date</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="date"
                      className="form-control"
                      value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ paddingLeft: '40px' }}
                    />
                    <Calendar size={16} className="gold-text" style={{ position: 'absolute', left: '14px' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Available Slots</label>
                  {checkingSlots ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                      <span>Verifying slot availability...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--color-danger)' }}>No slots available on this date. Try another date.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          className={`slot-chip ${selectedSlot === slot ? 'active' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '8px 4px',
                            background: selectedSlot === slot ? 'var(--gold-gradient)' : 'var(--bg-dark)',
                            color: selectedSlot === slot ? '#121212' : 'var(--text-secondary)',
                            border: `1px solid ${selectedSlot === slot ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-gold w-full mt-4"
                  disabled={!selectedSlot || checkingSlots}
                  onClick={handleBookingSubmit}
                  style={{ display: 'flex', gap: '6px' }}
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              createdBooking && (
                <UPIQrPayment
                  bookingId={createdBooking.id}
                  totalPrice={totalPrice}
                  paymentLinkId={createdBooking.paymentLinkId}
                  onPaymentSuccess={() => {
                    setBookingModalOpen(false);
                    onNavigate('customer-dashboard');
                  }}
                  onCancel={() => {
                    setPaymentStep(false);
                    setCreatedBooking(null);
                  }}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div id="review-modal" className="modal show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}></div>
          <div className="modal-content text-center" style={{ maxWidth: '400px', width: '90%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', padding: '30px', borderRadius: 'var(--border-radius-lg)', position: 'relative' }}>
            <button className="modal-close" onClick={() => setReviewModalOpen(false)}>
              <X size={18} />
            </button>
            <div className="modal-body">
              <h3 className="gold-text playfair" style={{ fontSize: '24px', marginBottom: '4px' }}>Share Your Experience</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Your feedback helps us maintain premium standards</p>

              <div className="rating-selector my-4" style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <span
                    key={rating}
                    className="star-btn"
                    onClick={() => setReviewRating(rating)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '24px',
                      color: rating <= reviewRating ? 'var(--gold-primary)' : 'var(--text-muted)',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <Star size={24} fill={rating <= reviewRating ? 'currentColor' : 'none'} />
                  </span>
                ))}
              </div>

              <div className="form-group">
                <textarea
                  id="review-comments"
                  className="form-control"
                  placeholder="Describe your treatment experience in detail..."
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ resize: 'none', background: 'var(--bg-dark)' }}
                ></textarea>
              </div>

              <button className="btn btn-gold w-full mt-4" onClick={handleSubmitReview} disabled={!reviewText}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
