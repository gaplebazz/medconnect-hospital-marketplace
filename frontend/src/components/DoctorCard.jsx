import { Link } from 'react-router-dom';
import { Rating, Badge } from './Badge';
import { resolveImage, initials } from '../utils/helpers';

export default function DoctorCard({ doctor }) {
  const img = resolveImage(doctor.profilePhoto);
  return (
    <div className="provider-card">
      <div className="provider-card-media" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {img ? (
          <img src={img} alt={doctor.name} />
        ) : (
          <div className="avatar-circle" style={{ width: 64, height: 64, fontSize: '1.3rem' }}>
            {initials(doctor.name)}
          </div>
        )}
        {doctor.verificationStatus === 'approved' && <Badge type="verified">✓ Verified</Badge>}
      </div>
      <div className="provider-card-body">
        <div className="provider-card-title">{doctor.name}</div>
        <div className="provider-card-sub">{doctor.qualification}</div>
        <div className="provider-card-tags">
          <span className="tag-chip">{doctor.specialization}</span>
          <span className="tag-chip">{doctor.experience} yrs exp</span>
        </div>
        <div className="provider-card-sub">{doctor.city}, {doctor.state}</div>
        <div className="provider-card-footer">
          <Rating value={doctor.rating} count={doctor.numReviews} />
          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>₹{doctor.consultationFee}</span>
        </div>
        <Link to={`/doctors/${doctor._id}`} className="btn btn-primary btn-sm btn-block" style={{ marginTop: 8 }}>
          View Profile
        </Link>
      </div>
    </div>
  );
}
