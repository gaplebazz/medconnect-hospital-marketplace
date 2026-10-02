import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';
import Loader from '../components/Loader';

export function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.devResetToken) setDevToken(data.devResetToken);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <h2>Reset Your Password</h2>
          <p>Enter your email and we'll help you reset your password.</p>
        </div>
        {sent ? (
          <div className="alert-banner success">
            If an account exists for that email, a reset link has been generated.
            {devToken && (
              <div style={{ marginTop: 10 }}>
                <Link to={`/reset-password?token=${devToken}`} style={{ fontWeight: 700 }}>
                  Continue to reset password →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormInput label="Email Address" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button className="btn btn-primary btn-block" disabled={loading}>{loading ? <Loader inline /> : 'Send Reset Link'}</button>
          </form>
        )}
        <div className="auth-footer-link">
          <Link to="/login">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      showToast('Password reset successful. Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <h2>Set a New Password</h2>
        </div>
        {error && <div className="alert-banner error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <FormInput label="Reset Token" name="token" value={token} onChange={(e) => setToken(e.target.value)} required />
          <FormInput label="New Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <FormInput label="Confirm New Password" type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? <Loader inline /> : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  );
}
