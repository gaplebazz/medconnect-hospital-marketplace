import { NavLink } from 'react-router-dom';

// Each item can either be a real route (provide `to` + `end`) or a tab-switch
// button within a single-page dashboard (provide `onClick` + `active`).
export default function Sidebar({ items }) {
  return (
    <aside className="sidebar">
      {items.map((item) =>
        item.onClick ? (
          <button
            key={item.label}
            className={`sidebar-link${item.active ? ' active' : ''}`}
            onClick={item.onClick}
            type="button"
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span>{item.icon}</span> {item.label}
          </NavLink>
        )
      )}
    </aside>
  );
}
