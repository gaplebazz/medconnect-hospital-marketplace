export function Rating({ value = 0, count }) {
  return (
    <span className="rating-pill">
      ★ {Number(value || 0).toFixed(1)}
      {count !== undefined && <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>({count})</span>}
    </span>
  );
}

export function Badge({ type = 'verified', children }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}
