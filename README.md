# Salon Appointment System — Frontend

A React single-page application for the Salon Appointment & Time Slot Management System. Built with Vite, Tailwind CSS, and Socket.io for real-time slot availability updates.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| TypeScript | Type safety |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| React Hook Form | Form state management |
| Zod | Schema validation |
| Socket.io-client | Real-time WebSocket communication |
| React Hot Toast | Notifications |

---

## Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:3000`

---

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd salon-appointment-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

App will be available at `http://localhost:3001`

---

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

---

## Project Structure

```
src/
├── components/
│   └── ui/
│       ├── Sidebar.tsx          # Navigation sidebar
│       └── DashboardLayout.tsx  # Authenticated layout wrapper
├── hooks/
│   ├── useAuth.tsx              # Auth context and provider
│   ├── useSlotSocket.ts         # Real-time slot availability hook
│   └── useBulkJobSocket.ts      # Real-time bulk job progress hook
├── lib/
│   └── api.ts                   # Axios instance with interceptors
├── pages/
│   ├── Login.tsx                # Login page
│   ├── Register.tsx             # Registration page
│   ├── VerifyEmail.tsx          # Email verification page
│   ├── Dashboard.tsx            # Dashboard with stats
│   ├── Appointments.tsx         # Appointments list
│   ├── NewAppointment.tsx       # Book new appointment
│   ├── EditAppointment.tsx      # Edit existing appointment
│   ├── Services.tsx             # Services list and create
│   ├── Templates.tsx            # Notification template selection
│   ├── BulkUpload.tsx           # Excel upload with live progress
│   ├── BulkJobDetail.tsx        # Bulk job detail and logs
│   ├── Logs.tsx                 # Notification logs history
│   └── Settings.tsx             # App settings
├── types/
│   └── index.ts                 # Shared TypeScript types
├── App.tsx                      # Route definitions
├── main.tsx                     # Entry point
└── index.css                    # Global styles and Tailwind
```

---

## Features

### Authentication
- User registration with email verification
- Login with JWT token stored in `localStorage`
- Auto redirect to login on 401 response
- Role-based UI — customers and staff see different navigation

### Appointments
- View all appointments (staff sees all, customers see their own)
- Book new appointment with service and date selection
- Edit pending appointments
- Cancel appointments
- Staff can confirm appointments

### Real-time Slot Availability
When booking an appointment, the available time slots update in real-time via WebSocket. If another user books a slot while you are on the booking page:
- The slot disappears from the grid immediately
- If you had already selected that slot, it is cleared and you are notified with a toast message

This is handled by `useSlotSocket.ts` which subscribes to a room keyed by `serviceId + date` on the `/appointments` WebSocket namespace.

### Bulk Notifications (Staff only)
- Upload Excel file with customer appointment details
- Required columns in order: `customerName`, `customerEmail`, `service`, `date`, `startTime`
- Processing progress shown in real-time via WebSocket
- Per-row status (success/failed) shown in live log table
- Full log history viewable after processing completes

### Notification Templates (Staff only)
- View all seeded notification templates
- Set active template used for all confirmation emails
- Preview template body with placeholder variables

---

## Routing

| Path | Access | Description |
|------|--------|-------------|
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/verify-email` | Public | Email verification |
| `/dashboard` | Auth | Dashboard |
| `/appointments` | Auth | Appointments list |
| `/appointments/new` | Auth | Book appointment |
| `/appointments/:id` | Auth | Edit appointment |
| `/services` | Auth | Services list |
| `/templates` | Staff | Template selection |
| `/bulk-jobs/upload` | Staff | Excel upload |
| `/bulk-jobs/:id` | Staff | Job detail |
| `/logs` | Staff | Notification logs |
| `/settings` | Staff | Settings |

---

## WebSocket Events

### Slot Availability (`/appointments` namespace)

| Event | Direction | Payload |
|-------|-----------|---------|
| `subscribe-slots` | Client → Server | `{ serviceId, date }` |
| `unsubscribe-slots` | Client → Server | `{ serviceId, date }` |
| `slots-updated` | Server → Client | `{ serviceId, date, availableSlots: string[] }` |

### Bulk Job Progress (`/bulk-jobs` namespace)

| Event | Direction | Payload |
|-------|-----------|---------|
| `subscribe-job` | Client → Server | `{ jobId }` |
| `job-started` | Server → Client | `{ jobId, totalRows }` |
| `row-processed` | Server → Client | `{ jobId, rowIndex, processedCount, successCount, failCount, customerEmail, status, error? }` |
| `job-completed` | Server → Client | `{ jobId, successCount, failCount, total }` |

---

## Available Scripts

```bash
npm run dev        # Start development server on port 3001
npm run build      # Build for production
npm run preview    # Preview production build locally
```

---

## Excel Upload Format

The bulk upload expects an Excel file (`.xlsx` or `.xls`) with the following columns in exact order:

| Column | Format | Example |
|--------|--------|---------|
| customerName | Text | Jane Doe |
| customerEmail | Valid email | jane@example.com |
| service | Text | Haircut |
| date | YYYY-MM-DD | 2026-05-01 |
| startTime | HH:MM | 10:00 |

Rows with invalid email format or missing fields are automatically marked as failed in the log.

---

## Default Accounts

After running the backend seed:

| Role | Email | Password |
|------|-------|----------|
| Staff | staff@salon.com | Staff@1234 |

Customer accounts are created via the registration flow.