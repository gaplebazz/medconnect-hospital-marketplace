export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1
  );

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</button>
      {nums.map((n, i) => (
        <span key={n} style={{ display: 'flex', gap: 8 }}>
          {i > 0 && nums[i - 1] !== n - 1 && <span style={{ padding: '0 4px' }}>…</span>}
          <button className={n === page ? 'active' : ''} onClick={() => onChange(n)}>
            {n}
          </button>
        </span>
      ))}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}
