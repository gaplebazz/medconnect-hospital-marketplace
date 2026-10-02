import { Link } from 'react-router-dom';
import { Rating, Badge } from './Badge';
import { resolveImage } from '../utils/helpers';

export default function HospitalCard({ hospital }) {
  const img = resolveImage(hospital.logo || hospital.images?.[0]);
  return (
    <div className="provider-card">
      <div className="provider-card-media">
        {img ? <img src={img} alt={hospital.name} /> : <div style={{ height: '100%' }} />}
        {hospital.verificationStatus === 'approved' && <Badge type="verified">✓ Verified</Badge>}
      </div>
      <div className="provider-card-body">
        <div className="provider-card-title">{hospital.name}</div>
        <div className="provider-card-sub">{hospital.city}, {hospital.state}</div>
        <div className="provider-card-tags">
          {(hospital.specialities || []).slice(0, 3).map((s) => (
            <span key={s} className="tag-chip">{s}</span>
          ))}
        </div>
        <div className="provider-card-tags">
          {hospital.emergencyService && <Badge type="emergency">Emergency</Badge>}
          {hospital.available247 && <Badge type="247">24/7</Badge>}
        </div>
        <div className="provider-card-footer">
          <Rating value={hospital.rating} count={hospital.numReviews} />
          <Link to={`/hospitals/${hospital._id}`} className="btn btn-outline btn-sm">View Details</Link>
        </div>
      </div>
    </div>
  );
}
