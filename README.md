# MedConnect — Hospital, Clinic & Doctor Marketplace

A full-stack healthcare marketplace where patients can search, compare, and book
appointments with verified hospitals, clinics, and doctors — and where providers
can register, manage their own listings, and track appointments and reviews.

---

## 1. Project Overview

MedConnect is a role-based marketplace platform with five account types:

- **Hospital** — lists departments, specialities, facilities, and doctors
- **Clinic** — lists services, consultation fees, and opening hours
- **Doctor** — lists qualifications, specialization, fees, and availability
- **Patient** — searches providers, saves favorites, books appointments, leaves reviews
- **Admin** — verifies/rejects new listings, manages users, views platform-wide stats

Every hospital, clinic, and doctor account starts in a **pending** state and only
appears in public search once an admin approves it.

## 2. Features

- Role-based registration (multi-step) and login with JWT authentication
- bcrypt password hashing, protected routes, role-based authorization
- Real MongoDB-backed search, filtering (including minimum rating), sorting, and pagination for all listing types
- Image uploads (logos, profile photos, gallery images) via Multer — plus seeded demo data ships with real placeholder photos out of the box
- Doctors can be linked to a real, listed Hospital or Clinic at registration (or later from their dashboard), so they correctly appear under that provider's "Doctors" tab
- Appointment booking + status workflow (pending → confirmed/rejected → completed)
- Reviews with automatic rating recalculation per provider
- Admin dashboard with platform stats, monthly registration chart, verification queue, full listing management (approve/unpublish/delete any hospital, clinic, or doctor), review moderation, and speciality management
- Provider dashboards (overview stats, profile editing, appointment management, reviews) in a proper sidebar layout
- Patient dashboard (profile + photo, saved providers, appointments with a quick "book new" shortcut, notifications)
- Responsive, custom-designed UI (Outfit + Inter typography, animated dropdowns/menus, custom-styled selects)
- Centralized error handling with friendly messages
- Rate limiting on auth endpoints, Helmet, CORS

## 3. Technology Stack

**Frontend:** React 18, React Router v6, Axios, Vite, plain CSS (custom design system)
**Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, Multer, express-rate-limit, Helmet
**Database:** MongoDB

## 4. Folder Structure

```
hospital-marketplace/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handler logic
│   ├── middleware/      # auth, role, upload, error handling, rate limiting
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── seed/            # Sample data seed script
│   ├── uploads/         # Uploaded images (created at runtime)
│   ├── utils/           # Helpers (asyncHandler, ApiError, token generator)
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance
    │   ├── components/   # Reusable UI components
    │   ├── context/      # Auth + Toast context providers
    │   ├── pages/         # Route-level pages
    │   ├── styles/        # global.css design system
    │   └── utils/         # Helpers
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 5. Installation

You'll need **Node.js 18+** and either a local MongoDB instance or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

Clone/unzip the project, then install both apps:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 6. MongoDB Setup

**Option A — Local MongoDB**

Install MongoDB Community Server and make sure it's running (default port `27017`).
No extra setup needed — the default `.env.example` already points to
`mongodb://127.0.0.1:27017/medconnect`.

**Option B — MongoDB Atlas (cloud, free tier)**

1. Create a free cluster at https://cloud.mongodb.com
2. Create a database user and allow your IP (or `0.0.0.0/0` for development)
3. Copy the connection string and use it as `MONGO_URI` in `backend/.env`

## 7. Environment Variables

**backend/.env** (copy from `backend/.env.example`):

```
MONGO_URI=mongodb://127.0.0.1:27017/medconnect
JWT_SECRET=replace_this_with_a_long_random_secret_key
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**frontend/.env** (copy from `frontend/.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

## 8. Backend Startup

```bash
cd backend
cp .env.example .env    # then edit MONGO_URI / JWT_SECRET as needed
npm run dev              # starts with nodemon on http://localhost:5000
```

You should see:
```
✅ MongoDB Connected: <host>/medconnect
🚀 Server running in development mode on port 5000
```

## 9. Frontend Startup

In a separate terminal:

```bash
cd frontend
cp .env.example .env
npm run dev               # starts on http://localhost:5173
```

Open http://localhost:5173 in your browser. The Vite dev server proxies
`/api` and `/uploads` requests to the backend automatically (see `vite.config.js`).

## 10. Seed the Database (optional but recommended)

Populates 3 sample hospitals, 3 clinics, 4 doctors, 10 specialities, and an admin account:

```bash
cd backend
npm run seed
```

This prints an admin login:
```
👤 Admin account created: admin@medconnect.test / Admin@123
```
All seeded provider accounts use the password `Password123`.

To remove only the seed data later (without touching real user registrations):

```bash
npm run seed:destroy
```

## 11. API Documentation

Base URL: `http://localhost:5000/api`

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register hospital/clinic/doctor/patient |
| POST | `/auth/login` | Public | Login with email or phone |
| GET | `/auth/me` | Private | Get current user + profile |
| POST | `/auth/forgot-password` | Public | Request password reset token |
| POST | `/auth/reset-password` | Public | Reset password with token |

### Hospitals / Clinics / Doctors (same shape for all three, replace `hospitals`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/hospitals` | Public | List with search/filter/sort/pagination |
| GET | `/hospitals/:id` | Public | Get single listing |
| POST | `/hospitals` | Private (owner/admin) | Create listing |
| PUT | `/hospitals/:id` | Private (owner/admin) | Update listing (supports image upload) |
| DELETE | `/hospitals/:id` | Private (owner/admin) | Delete listing |

### Reviews
| Method | Route | Access |
|---|---|---|
| GET | `/reviews?hospital=&clinic=&doctor=` | Public |
| POST | `/reviews` | Private (patient) |
| PUT | `/reviews/:id` | Private (owner) |
| DELETE | `/reviews/:id` | Private (owner/admin) |

### Appointments
| Method | Route | Access |
|---|---|---|
| POST | `/appointments` | Private (patient) |
| GET | `/appointments` | Private (role-scoped) |
| PUT | `/appointments/:id` | Private |
| DELETE | `/appointments/:id` | Private |

### Admin
| Method | Route | Access |
|---|---|---|
| GET | `/admin/dashboard` | Private (admin) |
| GET | `/admin/users` | Private (admin) |
| PUT | `/admin/verify/:id` | Private (admin) — body: `{ type, action }` |
| PUT | `/admin/user/:id/status` | Private (admin) |
| DELETE | `/admin/user/:id` | Private (admin) |

### Other
- `GET /specialities`, `POST /specialities` (admin), `DELETE /specialities/:id` (admin)
- `GET /notifications`, `PUT /notifications/:id`, `PUT /notifications/read-all`
- `GET /patients/saved`, `POST /patients/save`, `PUT /patients/profile`
- `GET /dashboard/overview`, `GET /dashboard/doctors` (provider-only)

## 12. Production Build Instructions

**Backend:**
```bash
cd backend
npm install --omit=dev
NODE_ENV=production npm start
```
Use a process manager like PM2 in production, and set a strong `JWT_SECRET`.

**Frontend:**
```bash
cd frontend
npm run build
```
This outputs static files to `frontend/dist/`, which can be served by any static
host (Nginx, Vercel, Netlify) or served from the backend with `express.static`.
Update `VITE_API_URL` to point at your deployed backend URL before building.

---

## Notes

- Seeded demo hospitals/clinics/doctors use free, no-API-key image sources so the app looks
  complete and realistic immediately after `npm run seed`: ui-avatars.com for hospital/clinic
  logos, real Pexels stock photography (free license, topically matched — hospital wards for
  hospitals, a dental clinic series for the dental clinic, an eye-exam series for the eye
  clinic) for gallery images and the "Popular Specialities" section, and randomuser.me
  portrait photos for doctor profiles. These need normal internet access on the machine
  running the frontend (not an API key) — swap them for real uploaded photos any time from
  each provider's dashboard.
- Password reset emails are not sent in this demo — the reset token is logged to
  the server console and also returned in the API response when `NODE_ENV=development`,
  so the full forgot/reset flow is testable end-to-end. Wire up a real email
  service (Nodemailer, SendGrid, etc.) for production use.
- Social login buttons on the login page are UI placeholders only.
- The "Map placeholder" on detail pages is a static box; swap in a real maps
  provider (Google Maps, Mapbox) if needed.
- "Sort by distance" isn't implemented since it requires a maps/geocoding API; the
  homepage instead offers a "Browse by city" shortcut as a lightweight alternative.
