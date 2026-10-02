import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ClinicCard from '../components/ClinicCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import FormInput from '../components/FormInput';

export default function ClinicListing() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [speciality, setSpeciality] = useState(searchParams.get('speciality') || '');
  const [maxFee, setMaxFee] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/clinics', { params: { search, city, speciality, maxFee, minRating, sort, page, limit: 9 } })
      .then((res) => setData(res.data))
      .catch(() => setData({ data: [], pages: 1, total: 0 }))
      .finally(() => setLoading(false));
  }, [search, city, speciality, maxFee, minRating, sort, page]);

  return (
    <div className="container listing-page">
      <div className="listing-head">
        <h2 style={{ fontSize: '1.7rem' }}>Clinics</h2>
        <p style={{ color: 'var(--color-muted)' }}>Find convenient outpatient clinics near you</p>
      </div>

      <div className="listing-layout">
        <aside className="filters-panel card" style={{ padding: 20 }}>
          <h3>Filters</h3>
          <FormInput label="Search" name="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Clinic name..." />
          <FormInput label="City" name="city" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} />
          <FormInput label="Speciality" name="speciality" value={speciality} onChange={(e) => { setSpeciality(e.target.value); setPage(1); }} />
          <FormInput label="Max Consultation Fee (₹)" type="number" name="maxFee" value={maxFee} onChange={(e) => { setMaxFee(e.target.value); setPage(1); }} />
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
            <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{data.total} clinics found</span>
            <select className="field-select" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="rating">Sort by Rating</option>
              <option value="fee">Sort by Fee</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : data.data.length === 0 ? (
            <EmptyState icon="🏨" title="No clinics found" message="Try adjusting your filters or search terms." />
          ) : (
            <>
              <div className="grid-3">
                {data.data.map((c) => <ClinicCard key={c._id} clinic={c} />)}
              </div>
              <Pagination page={data.page} pages={data.pages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
