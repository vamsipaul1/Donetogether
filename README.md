# DoneTogether - Team Collaboration Platform

DoneTogether is a premium, high-performance team collaboration platform designed for modern squads. It features a sleek glassmorphic UI, real-time data synchronization, and advanced project management capabilities.

## 🚀 Project Status: Production Ready & Polished
The project has successfully completed its "Alpha" phase. It has been fully linted, type-checked, and validated for production deployment.

- **Build Status**: ✅ Passing (`npm run build`)
- **Lint Status**: ✅ Zero Errors (`npm run lint`)
- **Type Safety**: ✅ Fully Typed with TypeScript
- **Database**: ✅ Migrations organized in `supabase/migrations` (Schema Fixed & Optimized)

---

## 🔥 Recent Updates (v0.1.0-alpha)

### 1. Robust Invite & Onboarding System
- **QRCode & Links**: Fully functional QR code generation and instant invite links (`/join?code=...`) for seamless team onboarding.
- **Smart Emails**: Integrated `mailto` capability for sending formatted email invites directly from the dashboard.
- **Auto-Join**: Intelligent handling of join codes with improved error validation and user feedback.

### 2. "Mission Control" (Waiting Room)
- **Immersive experience** for new projects waiting for team members.
- **Owner Bypass**: Team Leaders can now instantly access the dashboard via the **"ENTER MISSION CONTROL"** button without waiting for the full team.
- **Real-time Status**: Live updates on team readiness and member joins.

### 3. Critical Fixes & Stability
- **Schema Cleanup**: Resolved all database schema discrepancies (duplicate keys, missing columns).
- **Security**: Simplified and corrected Row Level Security (RLS) policies for smoother task management.
- **Type Safety**: Fixed specific column type errors (`role` vs `type`) in member management.

---

## ✨ Primary Features

### 1. Advanced Project Views
- **Home Dashboard**: Personalized view with dynamic progress rings and daily task summaries.
- **Kanban Board**: Intuitive drag-and-drop workflow for managing task statuses.
- **Timeline (Gantt)**: Interactive timeline for visual scheduling, enforcing task deadlines within project boundaries.
- **Overview & Analytics**: Team workload visualization, member performance metrics, and project health monitoring.

### 2. Smart Teaming & Governance
- **Role Selection**: Dedicated flows for **Team Leaders** and **Team Members**.
- **Governance Modal**: Complete control over team permissions (task management, inviting, analytics access) and ownership transfer.
- **Member Management**: Owners can remove members or update roles easily.

### 3. Realtime Group Chat System
- **WhatsApp-Style Interface**: Clean, modern chat UI with message bubbles and smooth animations.
- **Instant Messaging**: Real-time message delivery using Supabase Realtime.
- **Smart Features**: Typing indicators, message editing, role badges, and system notifications.

### 4. Premium UI/UX
- **Modern Aesthetics**: A tailored design system using HSL colors, smooth transitions, and glassmorphic elements.
- **Micro-interactions**: Powered by Framer Motion for a "living" interface feeling.
- **Dark Mode Support**: Seamless transition between light and dark themes.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Animation**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack Query (React Query) + Context API
- **Deployment**: Optimized for Vercel/Netlify

---

## 📂 Project Structure

```text
├── docs/               # Project documentation & architectural guides
├── public/             # Static assets
├── src/
│   ├── components/     # UI Components (Dashboard, Modals, Chat)
│   ├── contexts/       # Auth, Theme, and App State
│   ├── hooks/          # Custom React hooks (useChat, use-mobile)
│   ├── lib/            # Utility functions & Supabase client
│   ├── pages/          # Main application routes & Views
│   └── types/          # TypeScript definitions
├── supabase/
│   └── migrations/     # SQL migration scripts for database setup
└── [Config Files]      # Vite, Tailwind, ESLint, TSConfig
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- npm or bun

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor**.
3. Execute the key schema scripts in `supabase/migrations/` (most recent `COMPLETE_FIX_ALL_ISSUES.sql` is recommended for fresh setup).

### 4. Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📘 Documentation
Refer to the `docs/` folder for deeper insights:
- `ARCHITECTURE.md`: Technical deep dive into the system design.
- `PROJECT_SUMMARY.md`: Detailed record of the development journey.
- `DEPLOYMENT_CHECKLIST.md`: Steps for final production launch.

---

## ⚖️ License
Privately developed. All rights reserved.
