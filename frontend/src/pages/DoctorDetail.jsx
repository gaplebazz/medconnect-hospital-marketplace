import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Rating, Badge } from '../components/Badge';
import { resolveImage, initials } from '../utils/helpers';
import Loader from '../components/Loader';
import ReviewsSection from '../components/ReviewsSection';
import BookAppointmentModal from '../components/BookAppointmentModal';

export default function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/doctors/${id}`)
      .then((res) => setDoctor(res.data.data))
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSave = async () => {
    if (!user) return showToast('Please log in as a patient to save doctors.', 'error');
    if (user.role !== 'patient') return showToast('Only patient accounts can save providers.', 'error');
    try {
      const { data } = await api.post('/patients/save', { targetType: 'Doctor', targetId: id });
      setSaved(data.saved);
      showToast(data.message, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loader />;
  if (!doctor) return <div className="container" style={{ padding: 60, textAlign: 'center' }}>Doctor not found. <Link to="/doctors">Back to listings</Link></div>;

  const photo = resolveImage(doctor.profilePhoto);

  return (
    <div>
      <div className="detail-cover" />
      <div className="container">
        <div className="detail-header-card">
          <div className="detail-logo">
            {photo ? <img src={photo} alt="" /> : <span style={{ fontSize: '1.6rem' }}>{initials(doctor.name)}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{doctor.name}</h2>
              {doctor.verificationStatus === 'approved' && <Badge type="verified">✓ Verified</Badge>}
            </div>
            <p style={{ color: 'var(--color-muted)', marginTop: 4 }}>{doctor.qualification} · {doctor.specialization}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Rating value={doctor.rating} count={doctor.numReviews} />
              <span className="tag-chip">{doctor.experience} yrs experience</span>
              <span style={{ fontWeight: 700 }}>₹{doctor.consultationFee} fee</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Book Consultation</button>
            <button className="btn btn-outline btn-sm" onClick={toggleSave}>{saved ? '★ Saved' : '☆ Save'}</button>
          </div>
        </div>

        <div className="detail-layout" style={{ marginTop: 28 }}>
          <div>
            <div className="dashboard-panel">
              <h3>About Dr. {doctor.name.replace(/^Dr\.?\s*/i, '')}</h3>
              <p style={{ color: 'var(--color-ink-soft)', marginTop: 10 }}>{doctor.about || 'No bio provided.'}</p>

              <h3 style={{ marginTop: 24 }}>Languages</h3>
              <div className="provider-card-tags" style={{ marginTop: 8 }}>
                {(doctor.languages || []).map((l) => <span key={l} className="tag-chip">{l}</span>)}
              </div>

              <h3 style={{ marginTop: 24 }}>Availability</h3>
              <div className="provider-card-tags" style={{ marginTop: 8 }}>
                {(doctor.availableDays || []).map((d) => <span key={d} className="tag-chip">{d}</span>)}
              </div>
              {doctor.availableTime && <p style={{ marginTop: 8, color: 'var(--color-muted)', fontSize: '0.88rem' }}>🕐 {doctor.availableTime}</p>}

              {(doctor.affiliatedHospital || doctor.affiliatedClinic || doctor.affiliation) && (
                <>
                  <h3 style={{ marginTop: 24 }}>Affiliation</h3>
                  <p style={{ marginTop: 8, color: 'var(--color-ink-soft)' }}>
                    {doctor.affiliatedHospital?.name || doctor.affiliatedClinic?.name || doctor.affiliation}
                  </p>
                </>
              )}
            </div>

            <ReviewsSection targetType="Doctor" targetId={id} />
          </div>

          <div>
            <div className="dashboard-panel">
              <h3>Contact</h3>
              <p style={{ marginTop: 10, fontSize: '0.9rem' }}>📞 {doctor.phone}</p>
              <p style={{ marginTop: 6, fontSize: '0.9rem' }}>✉️ {doctor.email}</p>
              <p style={{ marginTop: 6, fontSize: '0.9rem' }}>📍 {doctor.city}, {doctor.state}</p>
              <button className="btn btn-outline btn-block" style={{ marginTop: 14 }} onClick={() => setModalOpen(true)}>Book Consultation</button>
            </div>
          </div>
        </div>
      </div>

      <BookAppointmentModal open={modalOpen} onClose={() => setModalOpen(false)} targetType="Doctor" targetId={id} targetName={doctor.name} />
    </div>
  );
}
