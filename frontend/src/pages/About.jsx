export default function About() {
  return (
    <div className="container section">
      <div className="section-head"><div><h2>About MedConnect</h2><p>Connecting patients with trusted healthcare providers</p></div></div>
      <div className="grid-3">
        <div className="why-card">
          <div className="icon">🎯</div>
          <h3 style={{ fontSize: '1rem' }}>Our Mission</h3>
          <p style={{ color: 'var(--color-muted)', marginTop: 8, fontSize: '0.9rem' }}>
            To make finding quality healthcare simple, transparent, and accessible for everyone by connecting
            patients with verified hospitals, clinics, and doctors.
          </p>
        </div>
        <div className="why-card">
          <div className="icon">🔍</div>
          <h3 style={{ fontSize: '1rem' }}>What We Do</h3>
          <p style={{ color: 'var(--color-muted)', marginTop: 8, fontSize: '0.9rem' }}>
            MedConnect is a marketplace where healthcare providers can list their services and patients can
            search, compare, and book appointments — all backed by real reviews and admin-verified listings.
          </p>
        </div>
        <div className="why-card">
          <div className="icon">🤝</div>
          <h3 style={{ fontSize: '1rem' }}>Our Promise</h3>
          <p style={{ color: 'var(--color-muted)', marginTop: 8, fontSize: '0.9rem' }}>
            Every provider profile goes through an admin verification step before appearing publicly,
            so you can search with confidence.
          </p>
        </div>
      </div>
    </div>
  );
}
