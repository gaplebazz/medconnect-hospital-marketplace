export default function EmptyState({ icon = '🔍', title = 'Nothing here yet', message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p style={{ marginTop: 6 }}>{message}</p>}
    </div>
  );
}
