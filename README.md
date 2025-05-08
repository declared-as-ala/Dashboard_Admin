# 🧠 Admin Dashboard — Next.js + Firebase

A scalable **Admin Dashboard** built with **Next.js App Router**, **TypeScript**, **TailwindCSS**, and **Firebase**. This application is designed to manage users, handle reclamations, and display analytics in a clean and modular architecture.

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="https://github.com/user-attachments/assets/fe62d380-61b5-4cc7-9377-3048c0d024f7" width="230"/>
  <img src="https://github.com/user-attachments/assets/7e75a30e-c682-44e8-a75c-a0f4913755bc" width="230"/>
  <img src="https://github.com/user-attachments/assets/0bab73ca-b691-4320-9b7c-81c6eede6511" width="230"/>
  <img src="https://github.com/user-attachments/assets/ebf0cbec-b3df-49c1-9814-21699a85725c" width="230"/>
</div>


---



## 📁 Folder Structure

```
📦 admin-dashboard/
├── app/                        # Pages & routing (App Router)
│   ├── dashboard/              # Main dashboard analytics page
│   ├── reclamations/          # Page for managing reclamations
│   └── users-management/      # Page for managing user accounts
├── components/                # Reusable UI components (e.g., tables, modals)
├── hooks/                     # Custom React hooks (e.g., useUsers, useReclamations)
├── lib/                       # Firebase config & utility functions
├── public/                    # Static assets
├── .env.local                 # Firebase credentials & secrets
├── tailwind.config.ts        # TailwindCSS configuration
├── tsconfig.json             # TypeScript settings
├── next.config.js            # Next.js configuration
```

---

## 🧩 Features

### 📊 Dashboard
- Overview of key stats:
  - Total Users
  - Active / Blocked Users
  - User Growth (chart)
  - Total Reclamations
  - Pending vs Resolved ratios

### 📩 Reclamations Page
- View and manage all reclamations
- Filter by status: `Pending`, `Resolved`
- Optional date range filter

### 👤 User Management
- View list of all users
- Actions per user:
  - **Edit** (modal for name, email, phone, password, location)
  - **Block / Activate**
  - **Delete**

---

## 🚀 Tech Stack

| Purpose        | Technology Used |
|----------------|-----------------|
| **Framework**  | [Next.js 14+ (App Router)](https://nextjs.org/docs/app) |
| **UI**         | [Tailwind CSS](https://tailwindcss.com/) |
| **Database**   | [Firebase Firestore](https://firebase.google.com/docs/firestore) |
| **Auth**       | [Firebase Auth](https://firebase.google.com/docs/auth) |
| **Charts**     | [Recharts](https://recharts.org/) or [Chart.js](https://www.chartjs.org/) |
| **State**      | React Context, Custom Hooks |
| **Language**   | TypeScript |

---

## 🛠 Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/admin-dashboard.git
cd admin-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a `.env.local` file in the root with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Then set up your Firebase instance inside `lib/firebase.ts`:

```ts
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 4. Run the development server

```bash
npm run dev
```

---

## ✅ Best Practices Applied

- ✅ Modular directory structure (`components/`, `hooks/`, `lib/`)
- ✅ Strong typing with **TypeScript**
- ✅ Reusable and maintainable UI components
- ✅ Secured with Firebase Auth + Firestore Rules
- ✅ Clean Tailwind + ESLint + Prettier setup
- ✅ Uses **Next.js App Router** and layouts system

---

## 📌 To-Do (Enhancements)

- [ ] Add real-time updates using Firestore `onSnapshot`
- [ ] Implement role-based access control (Admin, Viewer)
- [ ] Add pagination for users & reclamations
- [ ] Optimize Firebase reads/writes with batched operations and indexes
- [ ] Add unit and integration tests

---

## 📸 Preview

> 📷 Add GIFs or screenshots of your working dashboard here

---

## 📝 License

MIT © YourName
