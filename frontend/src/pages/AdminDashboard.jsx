import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Sidebar from '../components/Sidebar';
import { DashboardCard } from '../components/DashboardCard';
import { formatDate, resolveImage } from '../utils/helpers';

const navItems = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'verify', icon: '✅', label: 'Verify Listings' },
  { key: 'listings', icon: '📋', label: 'Manage Listings' },
  { key: 'users', icon: '👥', label: 'Manage Users' },
  { key: 'reviews', icon: '⭐', label: 'Manage Reviews' },
  { key: 'specialities', icon: '🏷️', label: 'Manage Specialities' },
];

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [pendingHospitals, setPendingHospitals] = useState(null);
  const [pendingClinics, setPendingClinics] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState(null);
  const [users, setUsers] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [listingType, setListingType] = useState('Hospital');
  const [listings, setListings] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [specialities, setSpecialities] = useState(null);
  const [newSpeciality, setNewSpeciality] = useState({ name: '', icon: '🩺' });

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setStats(r.data.data));
  }, []);

  useEffect(() => {
    if (tab === 'verify' && !pendingHospitals) {
      Promise.all([
        api.get('/admin/users', { params: { role: 'hospital', status: 'pending', limit: 50 } }),
        api.get('/admin/users', { params: { role: 'clinic', status: 'pending', limit: 50 } }),
        api.get('/admin/users', { params: { role: 'doctor', status: 'pending', limit: 50 } }),
      ]).then(([h, c, d]) => {
        setPendingHospitals(h.data.data);
        setPendingClinics(c.data.data);
        setPendingDoctors(d.data.data);
      });
    }
    if (tab === 'users') {
      api.get('/admin/users', { params: { role: roleFilter || undefined, limit: 50 } }).then((r) => setUsers(r.data.data));
    }
    if (tab === 'listings') {
      api.get('/admin/listings', { params: { type: listingType, limit: 50 } }).then((r) => setListings(r.data.data));
    }
    if (tab === 'reviews' && !reviews) {
      api.get('/reviews', { params: { limit: 50 } }).then((r) => setReviews(r.data.data));
    }
    if (tab === 'specialities' && !specialities) {
      api.get('/specialities').then((r) => setSpecialities(r.data.data));
    }
  }, [tab, roleFilter, listingType]);

  const verify = async (type, userDoc, action) => {
    try {
      await api.put(`/admin/verify/${userDoc.profileRef}`, { type, action });
      showToast(`Listing ${action}d.`, 'success');
      if (type === 'Hospital') setPendingHospitals((prev) => prev.filter((u) => u._id !== userDoc._id));
      if (type === 'Clinic') setPendingClinics((prev) => prev.filter((u) => u._id !== userDoc._id));
      if (type === 'Doctor') setPendingDoctors((prev) => prev.filter((u) => u._id !== userDoc._id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updateUserStatus = async (id, status) => {
    try {
      await api.put(`/admin/user/${id}/status`, { status });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status } : u)));
      showToast(`User status set to ${status}.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user and their profile permanently?')) return;
    try {
      await api.delete(`/admin/user/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showToast('User deleted.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const toggleListingVerification = async (listing, action) => {
    try {
      await api.put(`/admin/verify/${listing._id}`, { type: listingType, action });
      setListings((prev) => prev.map((l) => (l._id === listing._id ? { ...l, verificationStatus: action === 'approve' ? 'approved' : 'rejected' } : l)));
      showToast(`Listing ${action}d.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteListing = async (listing) => {
    if (!confirm(`Permanently delete "${listing.name}"? This cannot be undone.`)) return;
    const endpoint = { Hospital: 'hospitals', Clinic: 'clinics', Doctor: 'doctors' }[listingType];
    try {
      await api.delete(`/${endpoint}/${listing._id}`);
      setListings((prev) => prev.filter((l) => l._id !== listing._id));
      showToast('Listing deleted.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      showToast('Review deleted.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const addSpeciality = async (e) => {
    e.preventDefault();
    if (!newSpeciality.name.trim()) return;
    try {
      const { data } = await api.post('/specialities', newSpeciality);
      setSpecialities((prev) => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewSpeciality({ name: '', icon: '🩺' });
      showToast('Speciality added.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteSpeciality = async (id) => {
    if (!confirm('Remove this speciality?')) return;
    try {
      await api.delete(`/specialities/${id}`);
      setSpecialities((prev) => prev.filter((s) => s._id !== id));
      showToast('Speciality removed.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!stats) return <Loader />;

  const maxMonthly = Math.max(1, ...stats.monthlyRegistrations.map((m) => m.count));

  return (
    <div className="dashboard-shell">
      <Sidebar items={navItems.map((n) => ({ to: '#', label: n.label, icon: n.icon, active: n.key === tab, onClick: () => setTab(n.key) }))} />
      <div className="dashboard-main">
        <div className="page-title-row"><h2>Admin Dashboard</h2></div>

        {tab === 'overview' && (
          <>
            <div className="stat-grid">
              <DashboardCard label="Total Users" value={stats.totalUsers} icon="👥" />
              <DashboardCard label="Hospitals" value={stats.totalHospitals} icon="🏥" />
              <DashboardCard label="Clinics" value={stats.totalClinics} icon="🏨" />
              <DashboardCard label="Doctors" value={stats.totalDoctors} icon="👨‍⚕️" />
              <DashboardCard label="Patients" value={stats.totalPatients} icon="🧑" />
              <DashboardCard label="Pending Verifications" value={stats.pendingVerifications} icon="⏳" />
              <DashboardCard label="Total Appointments" value={stats.totalAppointments} icon="📅" />
              <DashboardCard label="Total Reviews" value={stats.totalReviews} icon="⭐" />
            </div>

            <div className="dashboard-panel">
              <h3>Monthly Registrations (last 6 months)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160, marginTop: 20 }}>
                {stats.monthlyRegistrations.length === 0 ? (
                  <p style={{ color: 'var(--color-muted)' }}>No registration data yet.</p>
                ) : (
                  stats.monthlyRegistrations.map((m) => (
                    <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                      <div style={{
                        width: '100%', maxWidth: 46, background: 'var(--color-primary)', borderRadius: '6px 6px 0 0',
                        height: `${(m.count / maxMonthly) * 120 + 6}px`, transition: 'height 0.3s ease',
                      }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{m.month}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{m.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'verify' && (
          !pendingHospitals ? <Loader /> : (
            <>
              <div className="dashboard-panel">
                <h3>Pending Hospitals</h3>
                {pendingHospitals.length === 0 ? <EmptyState icon="🏥" title="Nothing pending" /> : (
                  <div className="table-simple-wrap"><table className="table-simple">
                    <thead><tr><th>Name</th><th>Email</th><th>Registered</th><th>Action</th></tr></thead>
                    <tbody>
                      {pendingHospitals.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td><td>{u.email}</td><td>{formatDate(u.createdAt)}</td>
                          <td style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => verify('Hospital', u, 'approve')}>Approve</button>
                            <button className="btn btn-outline btn-sm" onClick={() => verify('Hospital', u, 'reject')}>Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </div>
              <div className="dashboard-panel">
                <h3>Pending Clinics</h3>
                {pendingClinics.length === 0 ? <EmptyState icon="🏨" title="Nothing pending" /> : (
                  <div className="table-simple-wrap"><table className="table-simple">
                    <thead><tr><th>Name</th><th>Email</th><th>Registered</th><th>Action</th></tr></thead>
                    <tbody>
                      {pendingClinics.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td><td>{u.email}</td><td>{formatDate(u.createdAt)}</td>
                          <td style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => verify('Clinic', u, 'approve')}>Approve</button>
                            <button className="btn btn-outline btn-sm" onClick={() => verify('Clinic', u, 'reject')}>Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </div>
              <div className="dashboard-panel">
                <h3>Pending Doctors</h3>
                {pendingDoctors.length === 0 ? <EmptyState icon="👨‍⚕️" title="Nothing pending" /> : (
                  <div className="table-simple-wrap"><table className="table-simple">
                    <thead><tr><th>Name</th><th>Email</th><th>Registered</th><th>Action</th></tr></thead>
                    <tbody>
                      {pendingDoctors.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td><td>{u.email}</td><td>{formatDate(u.createdAt)}</td>
                          <td style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => verify('Doctor', u, 'approve')}>Approve</button>
                            <button className="btn btn-outline btn-sm" onClick={() => verify('Doctor', u, 'reject')}>Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </div>
            </>
          )
        )}

        {tab === 'listings' && (
          <div className="dashboard-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h3>All Listings</h3>
              <select className="field-select" style={{ width: 200 }} value={listingType} onChange={(e) => { setListingType(e.target.value); setListings(null); }}>
                <option value="Hospital">Hospitals</option>
                <option value="Clinic">Clinics</option>
                <option value="Doctor">Doctors</option>
              </select>
            </div>
            {!listings ? <Loader /> : listings.length === 0 ? <EmptyState icon="📋" title="No listings found" /> : (
              <div className="table-simple-wrap"><table className="table-simple">
                <thead><tr><th></th><th>Name</th><th>City</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {listings.map((l) => {
                    const img = resolveImage(l.logo || l.profilePhoto || l.images?.[0]);
                    return (
                      <tr key={l._id}>
                        <td>
                          {img ? (
                            <img src={img} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }} />
                          ) : (
                            <div className="avatar-circle" style={{ width: 34, height: 34, fontSize: '0.8rem' }}>{l.name?.[0]}</div>
                          )}
                        </td>
                        <td>{l.name}</td>
                        <td>{l.city}</td>
                        <td>★ {(l.rating || 0).toFixed(1)} ({l.numReviews || 0})</td>
                        <td><span className={`status-pill status-${l.verificationStatus}`}>{l.verificationStatus}</span></td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          {l.verificationStatus !== 'approved' ? (
                            <button className="btn btn-primary btn-sm" onClick={() => toggleListingVerification(l, 'approve')}>Approve</button>
                          ) : (
                            <button className="btn btn-outline btn-sm" onClick={() => toggleListingVerification(l, 'reject')}>Unpublish</button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => deleteListing(l)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table></div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="dashboard-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h3>All Users</h3>
              <select className="field-select" style={{ width: 200 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All roles</option>
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {!users ? <Loader /> : users.length === 0 ? <EmptyState icon="👥" title="No users found" /> : (
              <div className="table-simple-wrap"><table className="table-simple">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                      <td><span className={`status-pill status-${u.status}`}>{u.status}</span></td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        {u.status !== 'suspended' ? (
                          <button className="btn btn-outline btn-sm" onClick={() => updateUserStatus(u._id, 'suspended')}>Suspend</button>
                        ) : (
                          <button className="btn btn-outline btn-sm" onClick={() => updateUserStatus(u._id, 'approved')}>Reactivate</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="dashboard-panel">
            <h3>All Reviews</h3>
            {!reviews ? <Loader /> : reviews.length === 0 ? <EmptyState icon="⭐" title="No reviews yet" /> : (
              reviews.map((r) => (
                <div key={r._id} className="review-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong>{r.user?.name || 'Anonymous'}</strong> — {'★'.repeat(r.rating)}
                      <p style={{ marginTop: 6, color: 'var(--color-ink-soft)', fontSize: '0.88rem' }}>{r.comment}</p>
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-muted)' }}>{formatDate(r.createdAt)} · {r.targetType}</span>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r._id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'specialities' && (
          <div className="dashboard-panel">
            <h3>Manage Specialities</h3>
            <form onSubmit={addSpeciality} style={{ display: 'flex', gap: 10, marginTop: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="field" style={{ marginBottom: 0, width: 80 }}>
                <label>Icon</label>
                <input className="field-input" value={newSpeciality.icon} onChange={(e) => setNewSpeciality((s) => ({ ...s, icon: e.target.value }))} />
              </div>
              <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
                <label>Speciality Name</label>
                <input className="field-input" value={newSpeciality.name} onChange={(e) => setNewSpeciality((s) => ({ ...s, name: e.target.value }))} placeholder="e.g. Psychiatry" />
              </div>
              <button className="btn btn-primary btn-sm" type="submit">Add Speciality</button>
            </form>

            {!specialities ? <Loader /> : specialities.length === 0 ? <EmptyState icon="🏷️" title="No specialities yet" /> : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {specialities.map((s) => (
                  <div key={s._id} className="tag-chip" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: '0.85rem' }}>
                    <span>{s.icon} {s.name}</span>
                    <button onClick={() => deleteSpeciality(s._id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontWeight: 700, cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
