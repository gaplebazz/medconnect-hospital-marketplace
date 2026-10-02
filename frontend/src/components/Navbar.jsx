import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/helpers';

const dashboardPath = {
  hospital: '/dashboard/hospital',
  clinic: '/dashboard/clinic',
  doctor: '/dashboard/doctor',
  patient: '/dashboard/patient',
  admin: '/dashboard/admin',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/hospitals', label: 'Hospitals' },
    { to: '/clinics', label: 'Clinics' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">✚</span> MedConnect
        </NavLink>

        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button className="user-chip" onClick={() => setDropdownOpen((o) => !o)}>
                <span className="avatar-circle">{initials(user.name)}</span>
                {user.name.split(' ')[0]}
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <a href={dashboardPath[user.role]} onClick={(e) => { e.preventDefault(); navigate(dashboardPath[user.role]); setDropdownOpen(false); }}>
                    Dashboard
                  </a>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost" style={{ display: 'none' }} />
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Register</button>
            </>
          )}
          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)}>☰</button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)}>{l.label}</NavLink>
        ))}
        {user ? (
          <>
            <NavLink to={dashboardPath[user.role]} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
            <button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
            <NavLink to="/register" onClick={() => setMenuOpen(false)}>Register</NavLink>
          </>
        )}
      </div>
    </header>
  );
}
