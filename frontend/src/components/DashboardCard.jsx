export function DashboardCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
        {icon && <span style={{ fontSize: '1.4rem' }}>{icon}</span>}
      </div>
    </div>
  );
}
