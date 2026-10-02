import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';
import Loader from '../components/Loader';

const dashboardPath = {
  hospital: '/dashboard/hospital',
  clinic: '/dashboard/clinic',
  doctor: '/dashboard/doctor',
  patient: '/dashboard/patient',
  admin: '/dashboard/admin',
};

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please enter your email/phone and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(identifier, password);
      showToast('Welcome back!', 'success');
      const redirectTo = location.state?.from?.pathname || dashboardPath[user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <div style={{ fontSize: '2rem' }}>✚</div>
          <h2>Welcome Back</h2>
          <p>Log in to manage your profile, appointments, and more.</p>
        </div>

        {error && <div className="alert-banner error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Email or Phone Number"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <label className="checkbox-row">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Loader inline /> : 'Log In'}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>
        <button type="button" className="social-btn" disabled title="Not configured in this demo">🔵 Continue with Google</button>
        <button type="button" className="social-btn" disabled title="Not configured in this demo">🔷 Continue with Facebook</button>

        <div className="auth-footer-link">
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Register</Link>
        </div>
      </div>
    </div>
  );
}
