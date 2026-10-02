import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem' }}>404</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 10 }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Back to Home</Link>
    </div>
  );
}
