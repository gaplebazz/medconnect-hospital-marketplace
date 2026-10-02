import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import FormInput from '../components/FormInput';
import FileUpload from '../components/FileUpload';
import Loader from '../components/Loader';

const roles = [
  { key: 'hospital', icon: '🏥', title: 'Register as Hospital', desc: 'List your hospital, departments & doctors' },
  { key: 'clinic', icon: '🏨', title: 'Register as Clinic', desc: 'Showcase your clinic and services' },
  { key: 'doctor', icon: '👨‍⚕️', title: 'Register as Doctor', desc: 'Build your professional profile' },
  { key: 'patient', icon: '🧑', title: 'Register as Patient', desc: 'Search & book appointments' },
];

const dashboardPath = {
  hospital: '/dashboard/hospital', clinic: '/dashboard/clinic', doctor: '/dashboard/doctor', patient: '/dashboard/patient',
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Register() {
  const [role, setRole] = useState(null);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [clinicOptions, setClinicOptions] = useState([]);

  useEffect(() => {
    if (role === 'doctor') {
      api.get('/hospitals', { params: { limit: 100, sort: 'name' } }).then((r) => setHospitalOptions(r.data.data)).catch(() => {});
      api.get('/clinics', { params: { limit: 100, sort: 'name' } }).then((r) => setClinicOptions(r.data.data)).catch(() => {});
    }
  }, [role]);

  const update = (field) => (e) => {
    const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleDay = (day) => {
    setForm((f) => {
      const list = f.availableDays || [];
      return { ...f, availableDays: list.includes(day) ? list.filter((d) => d !== day) : [...list, day] };
    });
  };

  if (!role) {
    return (
      <div className="role-select-page">
        <div className="auth-head">
          <h2 style={{ fontSize: '1.8rem' }}>Create Your Account</h2>
          <p>Choose the account type that matches what you're looking for</p>
        </div>
        <div className="role-grid">
          {roles.map((r) => (
            <button key={r.key} className="role-card" onClick={() => setRole(r.key)} style={{ cursor: 'pointer' }}>
              <div className="icon">{r.icon}</div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </button>
          ))}
        </div>
        <div className="auth-footer-link">
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Log in</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const fd = new FormData();
    fd.append('role', role);
    Object.entries(form).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => fd.append('images', file));
      } else if (key === 'logo' || key === 'profilePhoto') {
        fd.append(key, value);
      } else if (Array.isArray(value)) {
        fd.append(key, JSON.stringify(value));
      } else {
        fd.append(key, value);
      }
    });

    setLoading(true);
    try {
      const data = await register(fd);
      showToast(data.message, 'success');
      navigate(dashboardPath[role]);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = roles.find((r) => r.key === role);

  return (
    <div className="card reg-form-card">
      <div className="reg-form-head">
        <span className="icon">{roleInfo.icon}</span>
        <div>
          <h2>{roleInfo.title}</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem' }}>
            <button className="btn-ghost" style={{ padding: 0, fontSize: '0.85rem' }} onClick={() => setRole(null)}>← Choose a different account type</button>
          </p>
        </div>
      </div>

      {error && <div className="alert-banner error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 16px' }}>
        {role === 'hospital' && (
          <>
            <div className="form-section-title">Basic Information</div>
            <FormInput label="Hospital Name" name="hospitalName" value={form.hospitalName || ''} onChange={update('hospitalName')} required />
            <FormInput label="Hospital Admin Name" name="adminName" value={form.adminName || ''} onChange={update('adminName')} required />
            <div className="field-row">
              <FormInput label="Email" type="email" name="email" value={form.email || ''} onChange={update('email')} required />
              <FormInput label="Phone Number" name="phone" value={form.phone || ''} onChange={update('phone')} required />
            </div>
            <div className="field-row">
              <FormInput label="Password" type="password" name="password" value={form.password || ''} onChange={update('password')} required />
              <FormInput label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword || ''} onChange={update('confirmPassword')} required />
            </div>
            <FormInput label="Registration/License Number" name="licenseNumber" value={form.licenseNumber || ''} onChange={update('licenseNumber')} required />

            <div className="form-section-title">Location</div>
            <FormInput label="Hospital Address" name="address" value={form.address || ''} onChange={update('address')} required />
            <div className="field-row">
              <FormInput label="City" name="city" value={form.city || ''} onChange={update('city')} required />
              <FormInput label="State" name="state" value={form.state || ''} onChange={update('state')} required />
              <FormInput label="Pincode" name="pincode" value={form.pincode || ''} onChange={update('pincode')} required />
            </div>

            <div className="form-section-title">Profile Details</div>
            <FormInput label="Hospital Description" name="description" textarea value={form.description || ''} onChange={update('description')} />
            <FormInput label="Departments (comma separated)" name="departments" value={form.departments || ''} onChange={update('departments')} placeholder="Cardiology, Neurology, Orthopedics" />
            <FormInput label="Specialities (comma separated)" name="specialities" value={form.specialities || ''} onChange={update('specialities')} />
            <FormInput label="Facilities (comma separated)" name="facilities" value={form.facilities || ''} onChange={update('facilities')} placeholder="ICU, Ambulance, Pharmacy" />
            <FormInput label="Website" name="website" value={form.website || ''} onChange={update('website')} />
            <div className="field-row">
              <label className="checkbox-row"><input type="checkbox" checked={!!form.emergencyService} onChange={update('emergencyService')} /> Emergency Service Available</label>
              <label className="checkbox-row"><input type="checkbox" checked={!!form.available247} onChange={update('available247')} /> 24/7 Service</label>
            </div>

            <div className="form-section-title">Images</div>
            <FileUpload label="Hospital Logo" name="logo" onChange={update('logo')} />
            <FileUpload label="Hospital Images" name="images" multiple onChange={update('images')} />
          </>
        )}

        {role === 'clinic' && (
          <>
            <div className="form-section-title">Basic Information</div>
            <FormInput label="Clinic Name" name="clinicName" value={form.clinicName || ''} onChange={update('clinicName')} required />
            <FormInput label="Owner/Doctor Name" name="ownerName" value={form.ownerName || ''} onChange={update('ownerName')} required />
            <div className="field-row">
              <FormInput label="Email" type="email" name="email" value={form.email || ''} onChange={update('email')} required />
              <FormInput label="Phone" name="phone" value={form.phone || ''} onChange={update('phone')} required />
            </div>
            <div className="field-row">
              <FormInput label="Password" type="password" name="password" value={form.password || ''} onChange={update('password')} required />
              <FormInput label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword || ''} onChange={update('confirmPassword')} required />
            </div>
            <FormInput label="Registration Number" name="registrationNumber" value={form.registrationNumber || ''} onChange={update('registrationNumber')} required />

            <div className="form-section-title">Location</div>
            <FormInput label="Address" name="address" value={form.address || ''} onChange={update('address')} required />
            <div className="field-row">
              <FormInput label="City" name="city" value={form.city || ''} onChange={update('city')} required />
              <FormInput label="State" name="state" value={form.state || ''} onChange={update('state')} required />
              <FormInput label="Pincode" name="pincode" value={form.pincode || ''} onChange={update('pincode')} required />
            </div>

            <div className="form-section-title">Profile Details</div>
            <FormInput label="Description" name="description" textarea value={form.description || ''} onChange={update('description')} />
            <FormInput label="Specialities (comma separated)" name="specialities" value={form.specialities || ''} onChange={update('specialities')} />
            <FormInput label="Facilities (comma separated)" name="facilities" value={form.facilities || ''} onChange={update('facilities')} />
            <FormInput label="Opening Hours" name="openingHours" value={form.openingHours || ''} onChange={update('openingHours')} placeholder="9:00 AM - 8:00 PM" />
            <FormInput label="Website" name="website" value={form.website || ''} onChange={update('website')} />

            <div className="form-section-title">Images</div>
            <FileUpload label="Clinic Logo" name="logo" onChange={update('logo')} />
            <FileUpload label="Clinic Images" name="images" multiple onChange={update('images')} />
          </>
        )}

        {role === 'doctor' && (
          <>
            <div className="form-section-title">Basic Information</div>
            <FormInput label="Full Name" name="name" value={form.name || ''} onChange={update('name')} required />
            <div className="field-row">
              <FormInput label="Email" type="email" name="email" value={form.email || ''} onChange={update('email')} required />
              <FormInput label="Phone" name="phone" value={form.phone || ''} onChange={update('phone')} required />
            </div>
            <div className="field-row">
              <FormInput label="Password" type="password" name="password" value={form.password || ''} onChange={update('password')} required />
              <FormInput label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword || ''} onChange={update('confirmPassword')} required />
            </div>
            <FormInput label="Medical Registration Number" name="registrationNumber" value={form.registrationNumber || ''} onChange={update('registrationNumber')} required />

            <div className="form-section-title">Professional Details</div>
            <div className="field-row">
              <FormInput label="Qualification" name="qualification" value={form.qualification || ''} onChange={update('qualification')} placeholder="MBBS, MD" required />
              <FormInput label="Specialization" name="specialization" value={form.specialization || ''} onChange={update('specialization')} required />
            </div>
            <div className="field-row">
              <FormInput label="Experience (years)" type="number" name="experience" value={form.experience || ''} onChange={update('experience')} required />
              <FormInput label="Gender" name="gender" options={['male', 'female', 'other']} value={form.gender || ''} onChange={update('gender')} required />
              <FormInput label="Consultation Fee (₹)" type="number" name="consultationFee" value={form.consultationFee || ''} onChange={update('consultationFee')} required />
            </div>
            <FormInput label="Languages (comma separated)" name="languages" value={form.languages || ''} onChange={update('languages')} placeholder="English, Hindi" />

            <div className="field-row">
              <FormInput
                label="Affiliated Hospital (optional)"
                name="affiliatedHospital"
                value={form.affiliatedHospital || ''}
                onChange={update('affiliatedHospital')}
                options={[{ value: '', label: 'None' }, ...hospitalOptions.map((h) => ({ value: h._id, label: h.name }))]}
                hint="Pick a listed hospital to appear on its Doctors tab"
              />
              <FormInput
                label="Affiliated Clinic (optional)"
                name="affiliatedClinic"
                value={form.affiliatedClinic || ''}
                onChange={update('affiliatedClinic')}
                options={[{ value: '', label: 'None' }, ...clinicOptions.map((c) => ({ value: c._id, label: c.name }))]}
              />
            </div>
            <FormInput label="Affiliation (free text, e.g. private practice)" name="affiliation" value={form.affiliation || ''} onChange={update('affiliation')} placeholder="Optional if not linking a listed hospital/clinic" />

            <div className="form-section-title">Location</div>
            <FormInput label="Address" name="address" value={form.address || ''} onChange={update('address')} />
            <div className="field-row">
              <FormInput label="City" name="city" value={form.city || ''} onChange={update('city')} required />
              <FormInput label="State" name="state" value={form.state || ''} onChange={update('state')} required />
              <FormInput label="Pincode" name="pincode" value={form.pincode || ''} onChange={update('pincode')} />
            </div>

            <div className="form-section-title">About & Availability</div>
            <FormInput label="About Doctor" name="about" textarea value={form.about || ''} onChange={update('about')} />
            <div className="field">
              <label>Available Days</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {days.map((d) => (
                  <label key={d} className="checkbox-row" style={{ background: (form.availableDays || []).includes(d) ? 'var(--color-primary-light)' : '#fff', border: '1px solid var(--color-border)', padding: '6px 10px', borderRadius: 8 }}>
                    <input type="checkbox" checked={(form.availableDays || []).includes(d)} onChange={() => toggleDay(d)} /> {d}
                  </label>
                ))}
              </div>
            </div>
            <FormInput label="Available Time" name="availableTime" value={form.availableTime || ''} onChange={update('availableTime')} placeholder="10:00 AM - 4:00 PM" />

            <div className="form-section-title">Profile Photo</div>
            <FileUpload label="Profile Photo" name="profilePhoto" onChange={update('profilePhoto')} />
          </>
        )}

        {role === 'patient' && (
          <>
            <div className="form-section-title">Your Details</div>
            <FormInput label="Full Name" name="name" value={form.name || ''} onChange={update('name')} required />
            <div className="field-row">
              <FormInput label="Email" type="email" name="email" value={form.email || ''} onChange={update('email')} required />
              <FormInput label="Phone" name="phone" value={form.phone || ''} onChange={update('phone')} required />
            </div>
            <div className="field-row">
              <FormInput label="Password" type="password" name="password" value={form.password || ''} onChange={update('password')} required />
              <FormInput label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword || ''} onChange={update('confirmPassword')} required />
            </div>
            <div className="field-row">
              <FormInput label="Date of Birth" type="date" name="dateOfBirth" value={form.dateOfBirth || ''} onChange={update('dateOfBirth')} required />
              <FormInput label="Gender" name="gender" options={['male', 'female', 'other']} value={form.gender || ''} onChange={update('gender')} required />
            </div>
            <div className="field-row">
              <FormInput label="City" name="city" value={form.city || ''} onChange={update('city')} required />
              <FormInput label="State" name="state" value={form.state || ''} onChange={update('state')} required />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? <Loader inline /> : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
