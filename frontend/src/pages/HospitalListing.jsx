import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import HospitalCard from '../components/HospitalCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import FormInput from '../components/FormInput';

export default function HospitalListing() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [speciality, setSpeciality] = useState(searchParams.get('speciality') || '');
  const [emergency, setEmergency] = useState(false);
  const [available247, setAvailable247] = useState(false);
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { search, city, speciality, emergency, available247, minRating, sort, page, limit: 9 };
    api
      .get('/hospitals', { params })
      .then((res) => setData(res.data))
      .catch(() => setData({ data: [], pages: 1, total: 0 }))
      .finally(() => setLoading(false));
  }, [search, city, speciality, emergency, available247, minRating, sort, page]);

  return (
    <div className="container listing-page">
      <div className="listing-head">
        <h2 style={{ fontSize: '1.7rem' }}>Hospitals</h2>
        <p style={{ color: 'var(--color-muted)' }}>Browse verified hospitals near you</p>
      </div>

      <div className="listing-layout">
        <aside className="filters-panel card" style={{ padding: 20 }}>
          <h3>Filters</h3>
          <FormInput label="Search" name="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Hospital name..." />
          <FormInput label="City" name="city" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} placeholder="e.g. Jaipur" />
          <FormInput label="Speciality" name="speciality" value={speciality} onChange={(e) => { setSpeciality(e.target.value); setPage(1); }} placeholder="e.g. Cardiology" />
          <label className="checkbox-row" style={{ marginBottom: 12 }}>
            <input type="checkbox" checked={emergency} onChange={(e) => { setEmergency(e.target.checked); setPage(1); }} /> Emergency Available
          </label>
          <label className="checkbox-row" style={{ marginBottom: 12 }}>
            <input type="checkbox" checked={available247} onChange={(e) => { setAvailable247(e.target.checked); setPage(1); }} /> 24/7 Service
          </label>
          <FormInput
            label="Minimum Rating"
            name="minRating"
            value={minRating}
            onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
            options={[{ value: '', label: 'Any rating' }, { value: '4.5', label: '4.5+ ★' }, { value: '4', label: '4+ ★' }, { value: '3', label: '3+ ★' }]}
          />
        </aside>

        <div>
          <div className="results-toolbar">
            <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{data.total} hospitals found</span>
            <select className="field-select" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : data.data.length === 0 ? (
            <EmptyState icon="🏥" title="No hospitals found" message="Try adjusting your filters or search terms." />
          ) : (
            <>
              <div className="grid-3">
                {data.data.map((h) => <HospitalCard key={h._id} hospital={h} />)}
              </div>
              <Pagination page={data.page} pages={data.pages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
