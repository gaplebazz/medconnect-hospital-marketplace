import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Rating } from './Badge';
import { formatDate, initials } from '../utils/helpers';
import EmptyState from './EmptyState';

export default function ReviewsSection({ targetType, targetId, onReviewChange }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const paramKey = targetType.toLowerCase();

  const load = () => {
    setLoading(true);
    api.get('/reviews', { params: { [paramKey]: targetId } })
      .then((res) => setReviews(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [targetId]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return showToast('Please write a comment.', 'error');
    setSubmitting(true);
    try {
      await api.post('/reviews', { targetType, targetId, rating, comment });
      setComment('');
      setRating(5);
      showToast('Review submitted.', 'success');
      load();
      onReviewChange?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-panel">
      <h3>Patient Reviews</h3>

      {user?.role === 'patient' && (
        <form onSubmit={submitReview} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
          <div className="field">
            <label>Your Rating</label>
            <select className="field-select" style={{ width: 120 }} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </div>
          <div className="field">
            <label>Your Review</label>
            <textarea className="field-textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." />
          </div>
          <button className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <EmptyState icon="💬" title="No reviews yet" message="Be the first to share your experience." />
      ) : (
        reviews.map((r) => (
          <div key={r._id} className="review-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar-circle">{initials(r.user?.name || 'U')}</div>
                <div>
                  <strong>{r.user?.name || 'Anonymous'}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{formatDate(r.createdAt)}</div>
                </div>
              </div>
              <Rating value={r.rating} />
            </div>
            <p style={{ marginTop: 10, color: 'var(--color-ink-soft)' }}>{r.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}
