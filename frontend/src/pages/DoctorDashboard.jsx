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
import { formatDate, resolveImage, initials } from '../utils/helpers';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const navItems = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'profile', icon: '👨‍⚕️', label: 'My Profile' },
  { key: 'appointments', icon: '📅', label: 'Appointments' },
  { key: 'reviews', icon: '⭐', label: 'Reviews' },
  { key: 'notifications', icon: '🔔', label: 'Notifications' },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [clinicOptions, setClinicOptions] = useState([]);

  const loadOverview = () => api.get('/dashboard/overview').then((r) => {
    const p = r.data.data.profile;
    setOverview(r.data.data);
    setForm({
      name: p.name, phone: p.phone, qualification: p.qualification, specialization: p.specialization,
      experience: p.experience, consultationFee: p.consultationFee, languages: (p.languages || []).join(', '),
      affiliation: p.affiliation, affiliatedHospital: p.affiliatedHospital || '', affiliatedClinic: p.affiliatedClinic || '',
      address: p.address, city: p.city, state: p.state, pincode: p.pincode,
      about: p.about, availableDays: p.availableDays || [], availableTime: p.availableTime,
    });
  });

  useEffect(() => {
    loadOverview();
    api.get('/hospitals', { params: { limit: 100, sort: 'name' } }).then((r) => setHospitalOptions(r.data.data)).catch(() => {});
    api.get('/clinics', { params: { limit: 100, sort: 'name' } }).then((r) => setClinicOptions(r.data.data)).catch(() => {});
  }, []);
  useEffect(() => {
    if (tab === 'appointments' && !appointments) api.get('/appointments').then((r) => setAppointments(r.data.data));
    if (tab === 'reviews' && !reviews) api.get('/reviews', { params: { doctor: user.profileRef } }).then((r) => setReviews(r.data.data));
    if (tab === 'notifications' && !notifications) api.get('/notifications').then((r) => setNotifications(r.data.data));
  }, [tab]);

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const toggleDay = (day) => setForm((f) => ({
    ...f,
    availableDays: f.availableDays.includes(day) ? f.availableDays.filter((d) => d !== day) : [...f.availableDays, day],
  }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      if (photoFile) fd.append('profilePhoto', photoFile);
      await api.put(`/doctors/${overview.profile._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Profile updated.', 'success');
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
        <h2>Doctor Dashboard</h2>
        <span className={`status-pill status-${overview.verificationStatus}`}>{overview.verificationStatus}</span>
      </div>

      {overview.verificationStatus === 'pending' && (
        <div className="alert-banner warning">Your profile is pending admin verification and won't appear in public search until approved.</div>
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
            {resolveImage(overview.profile.profilePhoto) ? (
              <img src={resolveImage(overview.profile.profilePhoto)} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="avatar-circle" style={{ width: 72, height: 72, fontSize: '1.4rem' }}>{initials(overview.profile.name)}</div>
            )}
            <div>
              <h3>{overview.profile.name}</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginTop: 4 }}>{overview.profile.specialization} · {overview.profile.city}</p>
            </div>
          </div>
        </>
      )}

      {tab === 'profile' && (
        <div className="dashboard-panel" style={{ maxWidth: 640 }}>
          <h3>Edit Profile</h3>
          <form onSubmit={saveProfile}>
            <FormInput label="Full Name" name="name" value={form.name} onChange={updateField('name')} />
            <FormInput label="Phone" name="phone" value={form.phone} onChange={updateField('phone')} />
            <div className="field-row">
              <FormInput label="Qualification" name="qualification" value={form.qualification} onChange={updateField('qualification')} />
              <FormInput label="Specialization" name="specialization" value={form.specialization} onChange={updateField('specialization')} />
            </div>
            <div className="field-row">
              <FormInput label="Experience (years)" type="number" name="experience" value={form.experience} onChange={updateField('experience')} />
              <FormInput label="Consultation Fee (₹)" type="number" name="consultationFee" value={form.consultationFee} onChange={updateField('consultationFee')} />
            </div>
            <FormInput label="Languages (comma separated)" name="languages" value={form.languages} onChange={updateField('languages')} />
            <div className="field-row">
              <FormInput
                label="Affiliated Hospital"
                name="affiliatedHospital"
                value={form.affiliatedHospital}
                onChange={updateField('affiliatedHospital')}
                options={[{ value: '', label: 'None' }, ...hospitalOptions.map((h) => ({ value: h._id, label: h.name }))]}
              />
              <FormInput
                label="Affiliated Clinic"
                name="affiliatedClinic"
                value={form.affiliatedClinic}
                onChange={updateField('affiliatedClinic')}
                options={[{ value: '', label: 'None' }, ...clinicOptions.map((c) => ({ value: c._id, label: c.name }))]}
              />
            </div>
            <FormInput label="Affiliation (free text)" name="affiliation" value={form.affiliation} onChange={updateField('affiliation')} />
            <FormInput label="Address" name="address" value={form.address} onChange={updateField('address')} />
            <div className="field-row">
              <FormInput label="City" name="city" value={form.city} onChange={updateField('city')} />
              <FormInput label="State" name="state" value={form.state} onChange={updateField('state')} />
              <FormInput label="Pincode" name="pincode" value={form.pincode} onChange={updateField('pincode')} />
            </div>
            <FormInput label="About" name="about" textarea value={form.about} onChange={updateField('about')} />
            <div className="field">
              <label>Available Days</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {days.map((d) => (
                  <label key={d} className="checkbox-row" style={{ background: form.availableDays.includes(d) ? 'var(--color-primary-light)' : '#fff', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: 8 }}>
                    <input type="checkbox" checked={form.availableDays.includes(d)} onChange={() => toggleDay(d)} /> {d}
                  </label>
                ))}
              </div>
            </div>
            <FormInput label="Available Time" name="availableTime" value={form.availableTime} onChange={updateField('availableTime')} />
            <FileUpload label="Update Profile Photo" name="profilePhoto" onChange={setPhotoFile} />
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
                      {a.status === 'confirmed' && (
                        <button className="btn btn-outline btn-sm" onClick={() => updateAppointment(a._id, 'completed')}>Mark Completed</button>
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
