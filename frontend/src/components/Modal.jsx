export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: '1.2rem', padding: '2px 8px' }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
