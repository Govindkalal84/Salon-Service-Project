import { useState, useEffect, type FC } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Booking, Salon } from '../services/mockApi';
import { Calendar, Clock, X, Star, ArrowRight } from 'lucide-react';

export const CustomerDashboard: FC = () => {
  const { user, showToast } = useAuth();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal states
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      let backendBookings: Booking[] = [];
      try {
        const bookingsData = await apiRequest("/api/bookings/customer");
        if (Array.isArray(bookingsData)) {
          backendBookings = bookingsData;
        }
      } catch (err) {
        console.warn("Could not fetch remote customer bookings:", err);
      }

      // Also read local bookings from cache
      let localBookings: any[] = [];
      try {
        const stored = localStorage.getItem("bbeauty_user_bookings");
        if (stored) {
          localBookings = JSON.parse(stored);
          if (!Array.isArray(localBookings)) localBookings = [];
        }
      } catch {}

      // Merge: backend bookings take priority, local bookings provide zero-latency resilience
      const mergedMap = new Map<number | string, any>();

      // Put local bookings first
      localBookings.forEach(b => {
        if (b && b.id) {
          mergedMap.set(b.id, b);
        }
      });

      // Put backend bookings (overwrites matching ID)
      backendBookings.forEach(b => {
        if (b && b.id) {
          mergedMap.set(b.id, b);
        }
      });

      const allMerged = Array.from(mergedMap.values());
      // Sort newest first
      allMerged.sort((a, b) => {
        const timeA = new Date(a.startTime || a.createdAt || a.date || 0).getTime();
        const timeB = new Date(b.startTime || b.createdAt || b.date || 0).getTime();
        return timeB - timeA;
      });

      setBookings(allMerged);
      
      const salonsData = await apiRequest("/api/salons");
      setSalons(Array.isArray(salonsData) ? salonsData : []);
    } catch (e) {
      console.error("Failed to load customer dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => loadDashboardData();
    window.addEventListener('bbeauty_bookings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('bbeauty_bookings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getSalonName = (booking: any) => {
    if (booking?.salonName) return booking.salonName;
    const salonId = booking?.salonId;
    return salons.find(s => s.id === salonId)?.name || (salonId ? `Salon #${salonId}` : 'BBeauty Luxury Salon');
  };

  const handleCancelBooking = async (bookingId: number) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this reservation?");
    if (!confirmCancel) return;
    
    try {
      try {
        await apiRequest(`/api/bookings/${bookingId}/status?status=CANCELLED`, { method: "PUT" });
      } catch (err) {
        console.warn("Remote cancel sync note:", err);
      }

      // Update in local cache
      try {
        const stored = localStorage.getItem("bbeauty_user_bookings");
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((b: any) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b);
          localStorage.setItem("bbeauty_user_bookings", JSON.stringify(updated));
        }
      } catch {}

      showToast("Reservation cancelled successfully", "info");
      loadDashboardData();
    } catch (e: any) {
      showToast(e.message || "Failed to cancel booking", "danger");
    }
  };

  const handleOpenReview = (salonId: number) => {
    setSelectedSalonId(salonId);
    setReviewRating(5);
    setReviewText('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedSalonId || !reviewText) return;
    try {
      await apiRequest(`/api/reviews/salon${selectedSalonId}`, {
        method: "POST",
        body: {
          rating: reviewRating,
          reviewText: reviewText
        }
      });
      showToast("Thank you for your feedback!", "success");
      setReviewModalOpen(false);
    } catch (e: any) {
      showToast(e.message || "Failed to submit review", "danger");
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) {
      return { dateStr: 'Today', timeStr: 'Scheduled' };
    }
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) throw new Error("Invalid date");
      const dateStr = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
      return { dateStr, timeStr };
    } catch {
      const parts = String(isoString).split('T');
      return { dateStr: parts[0] || 'Scheduled', timeStr: parts[1]?.substring(0, 5) || '10:00 AM' };
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

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <span className="section-subtitle">Manage Reservations</span>
          <h2 className="playfair" style={{ fontSize: '32px' }}>My Bookings</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '10px 20px', fontSize: '14px' }}>
          Welcome back, <strong className="gold-text">{user?.fullName || 'Valued Guest'}</strong>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
          <Calendar size={40} className="gold-text" style={{ marginBottom: '15px' }} />
          <h3>No Reservations Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You haven't booked any grooming treatments yet. Find a premier salon and treat yourself!</p>
          <a
            href="#salons"
            className="btn btn-gold"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              fontWeight: 700
            }}
          >
            <span>Explore Premier Salons</span>
            <ArrowRight size={16} />
          </a>
        </div>
      ) : (
        <div className="table-responsive" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '16px 20px' }}>Ref ID</th>
                <th style={{ padding: '16px 20px' }}>Salon Destination</th>
                <th style={{ padding: '16px 20px' }}>Date</th>
                <th style={{ padding: '16px 20px' }}>Time Slot</th>
                <th style={{ padding: '16px 20px' }}>Amount</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => {
                const { dateStr, timeStr } = formatDateTime(booking.startTime || booking.date);
                const bookingRef = String(booking.id).replace(/\D/g, '').substring(0, 8) || String(booking.id);
                return (
                  <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition-smooth)' }}>
                    <td style={{ padding: '18px 20px', fontFamily: 'monospace', fontWeight: 600 }}>#RSV-{bookingRef}</td>
                    <td style={{ padding: '18px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>{getSalonName(booking)}</td>
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} className="gold-text" />
                        {dateStr}
                      </span>
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} className="gold-text" />
                        {timeStr}
                      </span>
                    </td>
                    <td style={{ padding: '18px 20px', fontWeight: 700, color: 'var(--gold-primary)' }}>₹{booking.totalPrice}</td>
                    <td style={{ padding: '18px 20px' }}>
                      <span className={`status-badge ${(booking.status || 'PENDING').toLowerCase()}`} style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: booking.status === 'CONFIRMED' ? 'var(--color-success)' : booking.status === 'PENDING' ? 'var(--color-warning)' : 'var(--color-danger)',
                        background: booking.status === 'CONFIRMED' ? 'rgba(48,209,88,0.1)' : booking.status === 'PENDING' ? 'rgba(255,159,10,0.1)' : 'rgba(255,69,58,0.1)'
                      }}>
                        {booking.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {booking.status === 'CONFIRMED' && (
                          <button
                            className="btn btn-outline"
                            onClick={() => handleOpenReview(booking.salonId || 1)}
                            style={{ padding: '6px 12px', fontSize: '11px', textTransform: 'none' }}
                          >
                            Review
                          </button>
                        )}
                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED' || !booking.status) && (
                          <button
                            className="btn btn-secondary text-danger"
                            onClick={() => handleCancelBooking(booking.id)}
                            style={{ padding: '6px 12px', fontSize: '11px', textTransform: 'none', border: '1px solid rgba(255,69,58,0.2)' }}
                          >
                            Cancel
                          </button>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Dialog */}
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
                      color: rating <= reviewRating ? 'var(--gold-primary)' : 'var(--text-muted)'
                    }}
                  >
                    <Star size={24} fill={rating <= reviewRating ? 'currentColor' : 'none'} />
                  </span>
                ))}
              </div>

              <div className="form-group">
                <textarea
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
