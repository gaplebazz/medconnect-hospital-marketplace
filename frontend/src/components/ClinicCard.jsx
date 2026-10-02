import { Link } from 'react-router-dom';
import { Rating, Badge } from './Badge';
import { resolveImage } from '../utils/helpers';

export default function ClinicCard({ clinic }) {
  const img = resolveImage(clinic.logo || clinic.images?.[0]);
  return (
    <div className="provider-card">
      <div className="provider-card-media">
        {img ? <img src={img} alt={clinic.name} /> : <div style={{ height: '100%' }} />}
        {clinic.verificationStatus === 'approved' && <Badge type="verified">✓ Verified</Badge>}
      </div>
      <div className="provider-card-body">
        <div className="provider-card-title">{clinic.name}</div>
        <div className="provider-card-sub">{clinic.ownerName} · {clinic.city}</div>
        <div className="provider-card-tags">
          {(clinic.specialities || []).slice(0, 3).map((s) => (
            <span key={s} className="tag-chip">{s}</span>
          ))}
        </div>
        {clinic.openingHours && <div className="provider-card-sub">🕐 {clinic.openingHours}</div>}
        <div className="provider-card-footer">
          <Rating value={clinic.rating} count={clinic.numReviews} />
          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>₹{clinic.consultationFee}</span>
        </div>
        <Link to={`/clinics/${clinic._id}`} className="btn btn-outline btn-sm btn-block" style={{ marginTop: 8 }}>
          View Details
        </Link>
      </div>
    </div>
  );
}
