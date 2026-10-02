import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import HospitalCard from '../components/HospitalCard';
import ClinicCard from '../components/ClinicCard';
import DoctorCard from '../components/DoctorCard';
import Loader from '../components/Loader';
import { specialityPhoto } from '../utils/helpers';

const faqs = [
  { q: 'Is MedConnect free to use for patients?', a: 'Yes. Searching for hospitals, clinics, and doctors, viewing profiles, and requesting appointments is completely free for patients.' },
  { q: 'How are hospitals, clinics, and doctors verified?', a: 'Every provider that registers is reviewed by our admin team before their profile becomes publicly visible, and only approved profiles display the verified badge.' },
  { q: 'Can I book an appointment directly through the platform?', a: 'Yes, from any doctor, clinic, or hospital profile you can submit an appointment request with your preferred date and time.' },
  { q: 'How do I register my hospital or clinic?', a: 'Click Register at the top of the page, choose your account type, and complete the listing form. Your profile goes live after admin verification.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [specialities, setSpecialities] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [cities, setCities] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [h, c, d, s] = await Promise.all([
          api.get('/hospitals', { params: { sort: 'rating', limit: 3 } }),
          api.get('/clinics', { params: { sort: 'rating', limit: 3 } }),
          api.get('/doctors', { params: { sort: 'rating', limit: 4 } }),
          api.get('/specialities'),
        ]);
        setHospitals(h.data.data);
        setClinics(c.data.data);
        setDoctors(d.data.data);
        setSpecialities(s.data.data);

        const allCities = [...h.data.data, ...c.data.data, ...d.data.data].map((item) => item.city).filter(Boolean);
        setCities([...new Set(allCities)].slice(0, 8));
      } catch (err) {
        // Homepage should still render even if the API is briefly unavailable
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (city) params.set('city', city);
    if (speciality) params.set('speciality', speciality);
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <span className="hero-eyebrow">✦ Trusted by thousands of patients</span>
          <h1>Find the Right <span>Hospital, Clinic & Doctor</span> Near You</h1>
          <p>Search verified healthcare providers, compare ratings, and book appointments — all in one place.</p>

          <form className="search-panel" onSubmit={handleSearch}>
            <input placeholder="Hospital, clinic, or doctor name" value={query} onChange={(e) => setQuery(e.target.value)} />
            <input placeholder="Location / city" value={city} onChange={(e) => setCity(e.target.value)} />
            <select value={speciality} onChange={(e) => setSpeciality(e.target.value)}>
              <option value="">All specialities</option>
              {specialities.map((s) => (
                <option key={s._id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : (
        <>
          <section className="section container">
            <div className="section-head">
              <div>
                <h2>Popular Hospitals</h2>
                <p>Highly-rated hospitals trusted by patients</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/hospitals')}>View All</button>
            </div>
            {hospitals.length ? (
              <div className="grid-3">
                {hospitals.map((h) => <HospitalCard key={h._id} hospital={h} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--color-muted)' }}>No hospitals listed yet — check back soon.</p>
            )}
          </section>

          <section className="section container">
            <div className="section-head">
              <div>
                <h2>Featured Clinics</h2>
                <p>Convenient outpatient care close to home</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/clinics')}>View All</button>
            </div>
            {clinics.length ? (
              <div className="grid-3">
                {clinics.map((c) => <ClinicCard key={c._id} clinic={c} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--color-muted)' }}>No clinics listed yet — check back soon.</p>
            )}
          </section>

          <section className="section container">
            <div className="section-head">
              <div>
                <h2>Top Doctors</h2>
                <p>Experienced specialists ready to help</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/doctors')}>View All</button>
            </div>
            {doctors.length ? (
              <div className="grid-4">
                {doctors.map((d) => <DoctorCard key={d._id} doctor={d} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--color-muted)' }}>No doctors listed yet — check back soon.</p>
            )}
          </section>

          {specialities.length > 0 && (
            <section className="section container">
              <div className="section-head">
                <div><h2>Popular Specialities</h2><p>Browse doctors by area of expertise</p></div>
              </div>
              <div className="grid-4">
                {specialities.slice(0, 8).map((s) => (
                  <div
                    key={s._id}
                    className="speciality-chip"
                    style={{ cursor: 'pointer', backgroundImage: `url(${specialityPhoto(s.name)})` }}
                    onClick={() => navigate(`/doctors?speciality=${encodeURIComponent(s.name)}`)}
                  >
                    <div className="speciality-chip-overlay">
                      <span className="icon">{s.icon}</span>
                      <span className="label">{s.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {cities.length > 0 && (
            <section className="section container">
              <div className="section-head">
                <div><h2>Nearby Healthcare Providers</h2><p>Browse hospitals, clinics, and doctors by city</p></div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {cities.map((city) => (
                  <button
                    key={city}
                    className="tag-chip"
                    style={{ fontSize: '0.9rem', padding: '10px 18px', cursor: 'pointer', border: 'none' }}
                    onClick={() => navigate(`/doctors?city=${encodeURIComponent(city)}`)}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section className="section container">
        <div className="section-head"><div><h2>How It Works</h2><p>Get matched with the right care in three simple steps</p></div></div>
        <div className="grid-3">
          <div className="step-card"><div className="step-num">1</div><h3>Search</h3><p style={{ color: 'var(--color-muted)', marginTop: 8 }}>Find hospitals, clinics, and doctors by name, location, or speciality.</p></div>
          <div className="step-card"><div className="step-num">2</div><h3>Compare</h3><p style={{ color: 'var(--color-muted)', marginTop: 8 }}>Check ratings, reviews, fees, and availability to make an informed choice.</p></div>
          <div className="step-card"><div className="step-num">3</div><h3>Book</h3><p style={{ color: 'var(--color-muted)', marginTop: 8 }}>Request an appointment directly through the provider's profile page.</p></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head"><div><h2>Why Choose MedConnect</h2></div></div>
        <div className="grid-4">
          <div className="why-card"><div className="icon">✅</div><h3 style={{ fontSize: '1rem' }}>Verified Providers</h3><p style={{ color: 'var(--color-muted)', marginTop: 6, fontSize: '0.88rem' }}>Every listing is reviewed before it goes live.</p></div>
          <div className="why-card"><div className="icon">⭐</div><h3 style={{ fontSize: '1rem' }}>Real Reviews</h3><p style={{ color: 'var(--color-muted)', marginTop: 6, fontSize: '0.88rem' }}>Ratings from patients who actually visited.</p></div>
          <div className="why-card"><div className="icon">📍</div><h3 style={{ fontSize: '1rem' }}>Local Search</h3><p style={{ color: 'var(--color-muted)', marginTop: 6, fontSize: '0.88rem' }}>Find care that's actually near you.</p></div>
          <div className="why-card"><div className="icon">🔒</div><h3 style={{ fontSize: '1rem' }}>Secure & Private</h3><p style={{ color: 'var(--color-muted)', marginTop: 6, fontSize: '0.88rem' }}>Your data is encrypted and never sold.</p></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head"><div><h2>What Patients Say</h2></div></div>
        <div className="grid-3">
          {[
            { name: 'Priya M.', text: 'Booking an appointment took less than two minutes. The doctor profiles are detailed and honest.' },
            { name: 'Rahul K.', text: 'I found a highly rated clinic near my home within minutes of searching. Great experience overall.' },
            { name: 'Sana A.', text: 'Being able to see verified badges gave me confidence I was choosing a legitimate hospital.' },
          ].map((t) => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-quote">"{t.text}"</p>
              <div className="testimonial-person">
                <div className="avatar-circle">{t.name[0]}</div>
                <strong>{t.name}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section container" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="section-head"><div><h2>Frequently Asked Questions</h2></div></div>
        {faqs.map((f, i) => (
          <div key={f.q} className="faq-item">
            <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
              {f.q} <span>{openFaq === i ? '−' : '+'}</span>
            </div>
            {openFaq === i && <p className="faq-answer">{f.a}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
