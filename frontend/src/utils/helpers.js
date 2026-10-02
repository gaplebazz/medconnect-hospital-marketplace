const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Uploaded file paths are stored as e.g. "/uploads/logos/xyz.png"; this resolves
// them to an absolute URL pointing at the backend server.
export function resolveImage(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Real, free-to-use Pexels photo IDs matched to common specialities, so the
// "Popular Specialities" section shows actual medical photography instead of
// plain emoji-only cards. Falls back to a generic care photo for anything
// outside this list (e.g. a speciality an admin adds later).
const SPECIALITY_PHOTOS = {
  Cardiology: 6129681,
  Orthopedics: 6129207,
  Pediatrics: 6129150,
  Dermatology: 6129195,
  Neurology: 6129052,
  Dentistry: 8669945,
  Gynecology: 6129149,
  'General Medicine': 6129040,
  ENT: 6129144,
  Ophthalmology: 5765829,
};
const DEFAULT_SPECIALITY_PHOTO = 6129204;

export function specialityPhoto(name) {
  const id = SPECIALITY_PHOTOS[name] || DEFAULT_SPECIALITY_PHOTO;
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`;
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
