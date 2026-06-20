import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Review } from '../services/mockApi';
import { Star, MessageSquare } from 'lucide-react';

interface ReviewSectionProps {
  salonId: number;
  triggerRefreshFlag: boolean;
  onOpenReviewModal: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ salonId, triggerRefreshFlag, onOpenReviewModal }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/reviews/salon${salonId}`);
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Reviews load failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [salonId, triggerRefreshFlag]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="reviews-container" style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="playfair">Guest Book & Reviews</h3>
        {user && (
          <button className="btn btn-outline btn-gold" onClick={onOpenReviewModal}>
            <Star size={14} style={{ marginRight: '6px' }} />
            Write Review
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px', textAlign: 'center' }}>
          <MessageSquare size={30} className="gold-text" style={{ marginBottom: '10px' }} />
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {reviews.map(review => (
            <div
              key={review.id}
              className="review-item"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--border-radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    className="review-avatar"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--gold-gradient)',
                      color: '#121212',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    U
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Guest User</span>
                </div>
                <div className="review-rating" style={{ display: 'flex', gap: '2px', color: 'var(--gold-primary)' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? 'currentColor' : 'none'}
                      stroke="currentColor"
                    />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                {review.reviewText}
              </p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {new Date(review.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
