import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Rating, Badge } from '../components/Badge';
import { resolveImage } from '../utils/helpers';
import Loader from '../components/Loader';
import ReviewsSection from '../components/ReviewsSection';
import BookAppointmentModal from '../components/BookAppointmentModal';

const tabs = ['Overview', 'Doctors', 'Gallery', 'Reviews'];

export default function ClinicDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/clinics/${id}`)
      .then((res) => setClinic(res.data.data))
      .catch(() => setClinic(null))
      .finally(() => setLoading(false));
    api.get('/doctors', { params: { limit: 50 } })
      .then((res) => setDoctors(res.data.data.filter((d) => d.affiliatedClinic === id)))
      .catch(() => {});
  }, [id]);

  const toggleSave = async () => {
    if (!user) return showToast('Please log in as a patient to save clinics.', 'error');
    if (user.role !== 'patient') return showToast('Only patient accounts can save providers.', 'error');
    try {
      const { data } = await api.post('/patients/save', { targetType: 'Clinic', targetId: id });
      setSaved(data.saved);
      showToast(data.message, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loader />;
  if (!clinic) return <div className="container" style={{ padding: 60, textAlign: 'center' }}>Clinic not found. <Link to="/clinics">Back to listings</Link></div>;

  const cover = resolveImage(clinic.images?.[0]);
  const logo = resolveImage(clinic.logo);

  return (
    <div>
      <div className="detail-cover">{cover && <img src={cover} alt="" />}</div>
      <div className="container">
        <div className="detail-header-card">
          <div className="detail-logo">{logo ? <img src={logo} alt="" /> : '🏨'}</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{clinic.name}</h2>
              {clinic.verificationStatus === 'approved' && <Badge type="verified">✓ Verified</Badge>}
            </div>
            <p style={{ color: 'var(--color-muted)', marginTop: 4 }}>{clinic.ownerName} · {clinic.address}, {clinic.city}, {clinic.state}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Rating value={clinic.rating} count={clinic.numReviews} />
              <span style={{ fontWeight: 700 }}>₹{clinic.consultationFee} consultation</span>
              {clinic.openingHours && <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>🕐 {clinic.openingHours}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Book Consultation</button>
            <button className="btn btn-outline btn-sm" onClick={toggleSave}>{saved ? '★ Saved' : '☆ Save'}</button>
          </div>
        </div>

        <div className="detail-tabs">
          {tabs.map((t) => (
            <div key={t} className={`detail-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ cursor: 'pointer' }}>{t}</div>
          ))}
        </div>

        <div className="detail-layout">
          <div>
            {tab === 'Overview' && (
              <div className="dashboard-panel">
                <h3>About</h3>
                <p style={{ color: 'var(--color-ink-soft)', marginTop: 10 }}>{clinic.description || 'No description provided.'}</p>
                <h3 style={{ marginTop: 24 }}>Specialities</h3>
                <div className="provider-card-tags" style={{ marginTop: 8 }}>
                  {(clinic.specialities || []).map((s) => <span key={s} className="tag-chip">{s}</span>)}
                </div>
                <h3 style={{ marginTop: 24 }}>Facilities</h3>
                <div className="provider-card-tags" style={{ marginTop: 8 }}>
                  {(clinic.facilities || []).map((f) => <span key={f} className="tag-chip">{f}</span>)}
                </div>
              </div>
            )}
            {tab === 'Doctors' && (
              <div className="dashboard-panel">
                <h3>Doctors at {clinic.name}</h3>
                {doctors.length === 0 ? (
                  <p style={{ color: 'var(--color-muted)', marginTop: 10 }}>No affiliated doctors listed yet.</p>
                ) : (
                  <div className="grid-3" style={{ marginTop: 14 }}>
                    {doctors.map((d) => <Link key={d._id} to={`/doctors/${d._id}`} className="tag-chip">{d.name}</Link>)}
                  </div>
                )}
              </div>
            )}

            {tab === 'Gallery' && (
              <div className="dashboard-panel">
                <h3>Gallery</h3>
                {clinic.images?.length ? (
                  <div className="gallery-grid" style={{ marginTop: 14 }}>
                    {clinic.images.map((img) => <img key={img} src={resolveImage(img)} alt="" />)}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-muted)', marginTop: 10 }}>No images uploaded yet.</p>
                )}
              </div>
            )}
            {tab === 'Reviews' && <ReviewsSection targetType="Clinic" targetId={id} />}
          </div>

          <div>
            <div className="dashboard-panel">
              <h3>Contact</h3>
              <p style={{ marginTop: 10, fontSize: '0.9rem' }}>📞 {clinic.phone}</p>
              <p style={{ marginTop: 6, fontSize: '0.9rem' }}>✉️ {clinic.email}</p>
              {clinic.website && <p style={{ marginTop: 6, fontSize: '0.9rem' }}>🌐 <a href={clinic.website} target="_blank" rel="noreferrer">{clinic.website}</a></p>}
              <button className="btn btn-outline btn-block" style={{ marginTop: 14 }} onClick={() => setModalOpen(true)}>Contact / Book Now</button>
            </div>
            <div className="dashboard-panel">
              <h3>Location</h3>
              <div style={{ height: 160, background: 'var(--color-primary-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
                📍 Map placeholder
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookAppointmentModal open={modalOpen} onClose={() => setModalOpen(false)} targetType="Clinic" targetId={id} targetName={clinic.name} />
    </div>
  );
}
