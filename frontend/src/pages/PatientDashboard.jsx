import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import FormInput from '../components/FormInput';
import FileUpload from '../components/FileUpload';
import Sidebar from '../components/Sidebar';
import HospitalCard from '../components/HospitalCard';
import ClinicCard from '../components/ClinicCard';
import DoctorCard from '../components/DoctorCard';
import { formatDate, resolveImage, initials } from '../utils/helpers';

const navItems = [
  { key: 'profile', icon: '👤', label: 'Profile' },
  { key: 'saved', icon: '⭐', label: 'Saved Providers' },
  { key: 'appointments', icon: '📅', label: 'Appointments' },
  { key: 'notifications', icon: '🔔', label: 'Notifications' },
  { key: 'settings', icon: '⚙️', label: 'Account Settings' },
];

export default function PatientDashboard() {
  const { user, refreshMe } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', city: user?.city || '', state: user?.state || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tab === 'saved' && !saved) api.get('/patients/saved').then((r) => setSaved(r.data.data));
    if (tab === 'appointments' && !appointments) api.get('/appointments').then((r) => setAppointments(r.data.data));
    if (tab === 'notifications' && !notifications) api.get('/notifications').then((r) => setNotifications(r.data.data));
  }, [tab]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      await api.put('/patients/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshMe();
      showToast('Profile updated.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      showToast('Appointment cancelled.', 'success');
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar items={navItems.map((n) => ({ label: n.label, icon: n.icon, active: n.key === tab, onClick: () => setTab(n.key) }))} />
      <div className="dashboard-main">
        <div className="page-title-row"><h2>Patient Dashboard</h2></div>

        {tab === 'profile' && (
          <div className="dashboard-panel" style={{ maxWidth: 520 }}>
            <h3>My Profile</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              {resolveImage(user?.avatar) ? (
                <img src={resolveImage(user.avatar)} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="avatar-circle" style={{ width: 64, height: 64, fontSize: '1.3rem' }}>{initials(user?.name || '')}</div>
              )}
              <div style={{ flex: 1 }}>
                <FileUpload label="Update Photo" name="avatar" onChange={setAvatarFile} />
              </div>
            </div>
            <form onSubmit={handleProfileSave}>
              <FormInput label="Full Name" name="name" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
              <FormInput label="Phone" name="phone" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
              <div className="field-row">
                <FormInput label="City" name="city" value={profileForm.city} onChange={(e) => setProfileForm((f) => ({ ...f, city: e.target.value }))} />
                <FormInput label="State" name="state" value={profileForm.state} onChange={(e) => setProfileForm((f) => ({ ...f, state: e.target.value }))} />
              </div>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        )}

        {tab === 'saved' && (
          !saved ? <Loader /> : (
            <>
              <div className="dashboard-panel">
                <h3>Saved Hospitals</h3>
                {saved.hospitals.length ? <div className="grid-3" style={{ marginTop: 14 }}>{saved.hospitals.map((h) => <HospitalCard key={h._id} hospital={h} />)}</div> : <EmptyState icon="🏥" title="No saved hospitals" />}
              </div>
              <div className="dashboard-panel">
                <h3>Saved Clinics</h3>
                {saved.clinics.length ? <div className="grid-3" style={{ marginTop: 14 }}>{saved.clinics.map((c) => <ClinicCard key={c._id} clinic={c} />)}</div> : <EmptyState icon="🏨" title="No saved clinics" />}
              </div>
              <div className="dashboard-panel">
                <h3>Saved Doctors</h3>
                {saved.doctors.length ? <div className="grid-4" style={{ marginTop: 14 }}>{saved.doctors.map((d) => <DoctorCard key={d._id} doctor={d} />)}</div> : <EmptyState icon="👨‍⚕️" title="No saved doctors" />}
              </div>
            </>
          )
        )}

        {tab === 'appointments' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctors')}>+ Book New Appointment</button>
            </div>
            {!appointments ? <Loader /> : appointments.length === 0 ? (
              <EmptyState icon="📅" title="No appointments yet" message="Book a consultation from any hospital, clinic, or doctor profile." />
            ) : (
              <div className="dashboard-panel">
                <div className="table-simple-wrap"><table className="table-simple">
                <thead><tr><th>Provider</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a._id}>
                      <td>{a.hospital?.name || a.clinic?.name || a.doctor?.name}</td>
                      <td>{formatDate(a.preferredDate)}</td>
                      <td>{a.preferredTime}</td>
                      <td><span className={`status-pill status-${a.status}`}>{a.status}</span></td>
                      <td>
                        {a.status === 'pending' && (
                          <button className="btn btn-outline btn-sm" onClick={() => cancelAppointment(a._id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table></div>
              </div>
            )}
          </>
        )}

        {tab === 'notifications' && (
          !notifications ? <Loader /> : notifications.length === 0 ? (
            <EmptyState icon="🔔" title="No notifications" />
          ) : (
            <div className="dashboard-panel">
              {notifications.map((n) => (
                <div key={n._id} className="review-item">
                  <strong>{n.title}</strong>
                  <p style={{ marginTop: 4, color: 'var(--color-ink-soft)', fontSize: '0.88rem' }}>{n.message}</p>
                  <span style={{ fontSize: '0.76rem', color: 'var(--color-muted)' }}>{formatDate(n.createdAt)}</span>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'settings' && (
          <div className="dashboard-panel" style={{ maxWidth: 460 }}>
            <h3>Account Settings</h3>
            <p style={{ color: 'var(--color-muted)', marginTop: 10, fontSize: '0.9rem' }}>
              Signed in as <strong>{user?.email}</strong>. To change your password, use the{' '}
              <Link to="/forgot-password" style={{ color: 'var(--color-primary)' }}>forgot password</Link> flow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

