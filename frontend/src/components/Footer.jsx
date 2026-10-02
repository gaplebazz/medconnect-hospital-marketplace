import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand" style={{ color: '#fff', marginBottom: 14 }}>
            <span className="brand-mark">✚</span> MedConnect
          </div>
          <p style={{ color: '#a7c1bd', fontSize: '0.88rem', maxWidth: 280 }}>
            The trusted marketplace for finding verified hospitals, clinics, and doctors near you.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/hospitals">Hospitals</Link>
          <Link to="/clinics">Clinics</Link>
          <Link to="/doctors">Doctors</Link>
          <Link to="/">Specialities</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/register">Join as a Provider</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} MedConnect. All rights reserved.
      </div>
    </footer>
  );
}
