import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import FormInput from '../components/FormInput';
import FileUpload from '../components/FileUpload';
import Sidebar from '../components/Sidebar';
import { DashboardCard } from '../components/DashboardCard';
import { formatDate, resolveImage } from '../utils/helpers';

const navItems = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'profile', icon: '🏨', label: 'Clinic Profile' },
  { key: 'appointments', icon: '📅', label: 'Appointments' },
  { key: 'reviews', icon: '⭐', label: 'Reviews' },
  { key: 'notifications', icon: '🔔', label: 'Notifications' },
];

export default function ClinicDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  const loadOverview = () => api.get('/dashboard/overview').then((r) => {
    const p = r.data.data.profile;
    setOverview(r.data.data);
    setForm({
      name: p.name, ownerName: p.ownerName, phone: p.phone, address: p.address, city: p.city, state: p.state,
      pincode: p.pincode, description: p.description, specialities: (p.specialities || []).join(', '),
      facilities: (p.facilities || []).join(', '), openingHours: p.openingHours, website: p.website,
      consultationFee: p.consultationFee,
    });
  });

  useEffect(() => { loadOverview(); }, []);
  useEffect(() => {
    if (tab === 'appointments' && !appointments) api.get('/appointments').then((r) => setAppointments(r.data.data));
    if (tab === 'reviews' && !reviews) api.get('/reviews', { params: { clinic: user.profileRef } }).then((r) => setReviews(r.data.data));
    if (tab === 'notifications' && !notifications) api.get('/notifications').then((r) => setNotifications(r.data.data));
  }, [tab]);

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logoFile) fd.append('logo', logoFile);
      imageFiles.forEach((f) => fd.append('images', f));
      await api.put(`/clinics/${overview.profile._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Clinic profile updated.', 'success');
      loadOverview();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateAppointment = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      showToast('Appointment updated.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!overview || !form) return <Loader />;

  return (
    <div className="dashboard-shell">
      <Sidebar items={navItems.map((n) => ({ label: n.label, icon: n.icon, active: n.key === tab, onClick: () => setTab(n.key) }))} />
      <div className="dashboard-main">
      <div className="page-title-row">
        <h2>Clinic Dashboard</h2>
        <span className={`status-pill status-${overview.verificationStatus}`}>{overview.verificationStatus}</span>
      </div>

      {overview.verificationStatus === 'pending' && (
        <div className="alert-banner warning">Your clinic profile is pending admin verification and won't appear in public search until approved.</div>
      )}

      {tab === 'overview' && (
        <>
          <div className="stat-grid">
            <DashboardCard label="Profile Views" value={overview.profileViews} icon="👁️" />
            <DashboardCard label="Total Appointments" value={overview.totalAppointments} icon="📅" />
            <DashboardCard label="Pending Requests" value={overview.pendingAppointments} icon="⏳" />
            <DashboardCard label="Average Rating" value={overview.rating.toFixed(1)} icon="⭐" />
          </div>
          <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {resolveImage(overview.profile.logo) ? (
              <img src={resolveImage(overview.profile.logo)} alt="" style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover' }} />
            ) : (
              <div className="detail-logo" style={{ width: 72, height: 72 }}>🏨</div>
            )}
            <div>
              <h3>{overview.profile.name}</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginTop: 4 }}>{overview.profile.city}, {overview.profile.state}</p>
            </div>
          </div>
        </>
      )}

      {tab === 'profile' && (
        <div className="dashboard-panel" style={{ maxWidth: 640 }}>
          <h3>Edit Clinic Profile</h3>
          <form onSubmit={saveProfile}>
            <FormInput label="Clinic Name" name="name" value={form.name} onChange={updateField('name')} />
            <FormInput label="Owner Name" name="ownerName" value={form.ownerName} onChange={updateField('ownerName')} />
            <FormInput label="Phone" name="phone" value={form.phone} onChange={updateField('phone')} />
            <FormInput label="Address" name="address" value={form.address} onChange={updateField('address')} />
            <div className="field-row">
              <FormInput label="City" name="city" value={form.city} onChange={updateField('city')} />
              <FormInput label="State" name="state" value={form.state} onChange={updateField('state')} />
              <FormInput label="Pincode" name="pincode" value={form.pincode} onChange={updateField('pincode')} />
            </div>
            <FormInput label="Description" name="description" textarea value={form.description} onChange={updateField('description')} />
            <FormInput label="Specialities (comma separated)" name="specialities" value={form.specialities} onChange={updateField('specialities')} />
            <FormInput label="Facilities (comma separated)" name="facilities" value={form.facilities} onChange={updateField('facilities')} />
            <div className="field-row">
              <FormInput label="Opening Hours" name="openingHours" value={form.openingHours} onChange={updateField('openingHours')} />
              <FormInput label="Consultation Fee (₹)" type="number" name="consultationFee" value={form.consultationFee} onChange={updateField('consultationFee')} />
            </div>
            <FormInput label="Website" name="website" value={form.website} onChange={updateField('website')} />
            <FileUpload label="Update Logo" name="logo" onChange={setLogoFile} />
            <FileUpload label="Add Gallery Images" name="images" multiple onChange={setImageFiles} />
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'appointments' && (
        !appointments ? <Loader /> : appointments.length === 0 ? <EmptyState icon="📅" title="No appointment requests yet" /> : (
          <div className="dashboard-panel">
            <div className="table-simple-wrap"><table className="table-simple">
              <thead><tr><th>Patient</th><th>Phone</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.patientName}</td>
                    <td>{a.patientPhone}</td>
                    <td>{formatDate(a.preferredDate)}</td>
                    <td>{a.preferredTime}</td>
                    <td><span className={`status-pill status-${a.status}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => updateAppointment(a._id, 'confirmed')}>Confirm</button>
                          <button className="btn btn-outline btn-sm" onClick={() => updateAppointment(a._id, 'rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )
      )}

      {tab === 'reviews' && (
        !reviews ? <Loader /> : reviews.length === 0 ? <EmptyState icon="⭐" title="No reviews yet" /> : (
          <div className="dashboard-panel">
            {reviews.map((r) => (
              <div key={r._id} className="review-item">
                <strong>{r.user?.name}</strong> — {'★'.repeat(r.rating)}
                <p style={{ marginTop: 6, color: 'var(--color-ink-soft)' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'notifications' && (
        !notifications ? <Loader /> : notifications.length === 0 ? <EmptyState icon="🔔" title="No notifications" /> : (
          <div className="dashboard-panel">
            {notifications.map((n) => (
              <div key={n._id} className="review-item">
                <strong>{n.title}</strong>
                <p style={{ marginTop: 4, color: 'var(--color-ink-soft)', fontSize: '0.88rem' }}>{n.message}</p>
              </div>
            ))}
          </div>
        )
      )}
      </div>
    </div>
  );
}
