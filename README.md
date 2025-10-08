# 🧠 SchedulIQ — Smart Resource Allocation & Scheduling System

SchedulIQ is an **AI-powered MERN Stack platform** designed to intelligently manage and optimize the allocation of campus resources such as rooms, labs, and equipment.  
It ensures **conflict-free scheduling**, **maximized utilization**, and **real-time availability** visibility — built for modern campuses.

---

## 🚀 Features

✅ **Real-Time Resource Management**  
View available rooms, labs, and equipment across time, location, and capacity dimensions.

✅ **Intelligent Conflict Detection**  
Automatic detection of booking conflicts and smart resolution recommendations.

✅ **Optimal Scheduling**  
AI/logic-based scheduling recommendations using historical usage, proximity, and resource type.

✅ **Usage Verification System**  
Tracks actual utilization vs. scheduled bookings to detect misuse or idle resources.

✅ **Data Analytics Dashboard**  
Visual insights on demand patterns, utilization rates, and optimization opportunities.

✅ **Smart Waiting List & Suggestions**  
If a resource is unavailable, SchedulIQ provides intelligent alternatives.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React.js, Vite, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Utilities** | Day.js, JWT Auth, REST APIs |
| **Deployment** | Docker / Render / Vercel (optional) |

---

## 📂 Folder Structure
SchedulIQ/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── BookingModal.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── models/
    │   ├── Resource.js
    │   ├── Booking.js
    │   └── User.js
    ├── routes/
    │   ├── resourceRoutes.js
    │   ├── bookingRoutes.js
    │   └── userRoutes.js
    ├── config/
    │   └── db.js
    ├── server.js
    ├── package.json
    └── .env

