# 🧘 YogaAI — AI-Powered Yoga & Wellness Platform

## 📖 Overview

YogaAI is a full-stack wellness application that uses **Google MediaPipe** to perform real-time yoga pose detection through the user's camera. The platform scores each pose using a weighted joint-angle algorithm, rewards users with **Yoga Coins**, tracks progress via an analytics dashboard, and includes guided meditation, an ambient sound mixer, a wellness store, and subscription management — all within a modern React + Vite single-page application backed by a Node.js/Express REST API and MongoDB.

---

## ✨ Features

### 🧘 AI Yoga Practice
- Live camera feed with real-time skeleton overlay rendered on HTML5 Canvas
- MediaPipe Pose landmarks mapped to 33 body keypoints
- Per-joint angle calculation and colour-coded feedback (🟢 green / 🟡 yellow / 🔴 red)
- Animated avatar canvas showing the target pose shape
- Session timer and accuracy score (0–100) computed server-side

### 🌸 Meditation Module
- Five meditation categories: Sleep, Focus, Anxiety Relief, Chakra Healing, Breathing
- Configurable timer (5 / 10 / 15 / 20 min) with visual countdown and breathing guide
- Ambient sound mixer — Rain, Temple Bells, Forest, Om Chanting, White Noise, Ocean Waves

### 📊 Analytics Dashboard
- Weekly accuracy bar chart (day-by-day breakdown)
- Pose performance table (average score per pose)
- Weakest joint tracker with error-count ranking
- 30-day calendar heat map (done / missed / future)
- Summary stats: total sessions, total minutes, best score, streak

### 🪙 Yoga Coin Reward System
- Score ≥ 90 → **10 coins**, ≥ 75 → **6 coins**, ≥ 50 → **3 coins**, else → **1 coin**
- Coins stored per user in MongoDB and displayed live in the nav bar
- Redeemable in the wellness store for discounts and free delivery

### 🛍️ Wellness Store
- Product catalogue: yoga mats, meditation cushions, resistance bands, herbal teas, etc.
- Add to cart drawer with coin-discount support and Razorpay payment integration
- Shop-owner role with a full inventory management dashboard (add / edit / delete products)

### ⭐ Subscription Plans 
| Plan | Price | Key Features |
|------|-------|--------------|
| Free | ₹0 | Basic pose detection, 5 poses, limited analytics |
| Standard | ₹200/mo | Full pose library, angle-based feedback, guided meditation, priority support |
| Premium | ₹500/mo | All Standard features + personalised plans, VIP support, max coin rewards |

### 👤 User Management
- JWT-based authentication (register / login / auto-restore session)
- Two roles: **user** (wellness member) and **shop** (store owner)
- Profile page with BMI calculator
- Help centre with searchable FAQ accordion
- Contact form with live submission feedback

---

## 🛠 Tech Stack

### Frontend (`client/`)
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| Vite | 5.2 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| MediaPipe Pose | 0.5 | Real-time pose landmark detection |
| MediaPipe Camera Utils | 0.3 | Camera feed handling |
| HTML5 Canvas API | — | Skeleton renderer & avatar canvas |
| React Context API | — | Global auth & coin state |

### Backend (`server/`)
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 4.19 | REST API framework |
| Mongoose | 8.3 | MongoDB ODM |
| bcryptjs | 2.4 | Password hashing (12 salt rounds) |
| jsonwebtoken | 9.0 | JWT auth tokens |
| dotenv | 16.4 | Environment variable management |
| nodemon | 3.1 | Dev auto-reload |

### Database
- **MongoDB** — document store for users and sessions
- Indexed on `{ user, date }` for fast per-user date-range queries

---

## 🚀 Getting Started

### Prerequisites
- Node.js **≥ 18**
- npm **≥ 9**
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A modern browser with webcam access (Chrome recommended for MediaPipe)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/yogaai.git
cd yogaai
```

### 2. Configure the Server

```bash
cd server
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/yogaai
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

> ⚠️ **Never commit `.env` to version control.** Use a strong random string for `JWT_SECRET` in production.

Install server dependencies and start:

```bash
npm install
npm run dev        # development (nodemon)
# or
npm start          # production
```

The server will start at `http://localhost:5000`. On successful MongoDB connection you will see:

```
✅  MongoDB connected
🚀  Server → http://localhost:5000
```

### 3. Configure the Client

```bash
cd ../client
npm install
npm run dev
```

The client dev server starts at `http://localhost:5173` and proxies all `/api` requests to `http://localhost:5000` via the Vite config.

> To point to a remote API, create `client/.env.local` and set:
> ```env
> VITE_API_URL=https://your-api-domain.com/api
> ```

### 4. Build for Production

```bash
cd client
npm run build      # outputs to client/dist/
npm run preview    # preview the production build locally
```

### 🚧 Future Scope & Limitations

This project is currently under active development. While the core features are functional, several components are still in progress and will be enhanced in future iterations.

### 🔧 Current Limitations
- The store module is static, and the shopping cart lacks full functionality, including a proper checkout flow.
- The subscription system is not yet integrated with Razorpay for real-time payments.
- Certain sections of the application still rely on static/mock data instead of dynamic backend-driven data.
- The meditation module currently does not include background music or audio guidance.
### 🚀 Future Enhancements
- Implement a fully functional e-commerce flow (cart + checkout + order management)
- Integrate secure online payments using Razorpay
- Replace all static data with real-time database-driven content
- Add guided meditation audio and music features
- Improve overall user experience and performance

Note: This project is a work in progress, and ongoing updates will continue to improve its functionality and user experience.
---

## 📁 Project Structure

```
yogaai/
├── client/                          # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                  # Root component & auth router
│       ├── main.jsx                 # React DOM entry point
│       ├── index.css                # Global styles & Tailwind directives
│       │
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state (user, coins, login/logout)
│       │
│       ├── data/                    # Static data & configuration
│       │   ├── poses.js             # YOGA_POSES catalogue (10 poses)
│       │   ├── meditation.js        # Meditation categories & ambient sounds
│       │   ├── store.js             # STORE_PRODUCTS catalogue
│       │   ├── subscriptions.js     # Plan definitions & feature comparison table
│       │   └── faq.js              # FAQ_DATA for Help page
│       │
│       ├── utils/
│       │   ├── api.js               # Fetch wrapper, authApi, poseApi, sessionApi
│       │   ├── poseEvaluators.js    # Client-side joint angle calculators (per pose)
│       │   ├── poseFeedback.js      # Human-readable feedback message builder
│       │   ├── sessionStorage.js    # Local session persistence helpers
│       │   └── bmi.js              # BMI calculation & category classifier
│       │
│       ├── hooks/
│       │   ├── useInView.js         # Intersection Observer for scroll animations
│       │   ├── useMeditationTimer.js # Countdown timer with tick/complete callbacks
│       │   └── useSessionTimer.js   # Yoga session elapsed-time tracker
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AuthModal.jsx    # Login / Register modal
│       │   │   ├── DashboardLayout.jsx  # Shell: sidebar + nav + page router
│       │   │   ├── DashboardNav.jsx # Top bar: coins, notifications, user avatar
│       │   │   └── Sidebar.jsx     # Left nav (user & shop role variants)
│       │   │
│       │   ├── ui/                  # Reusable design-system components
│       │   │   ├── GlassCard.jsx    # Frosted-glass card wrapper
│       │   │   ├── Btn.jsx          # Primary / outline / ghost button
│       │   │   ├── Badge.jsx        # Colour pill badge
│       │   │   ├── StatCard.jsx     # Icon + value + sub-label stat tile
│       │   │   └── SectionFade.jsx  # Scroll-triggered fade-in wrapper
│       │   │
│       │   ├── yoga/
│       │   │   ├── PoseCamera.jsx   # MediaPipe camera + Canvas skeleton overlay
│       │   │   ├── AvatarCanvas.jsx # Animated stick-figure target pose display
│       │   │   ├── SkeletonRenderer.js  # Canvas drawing utilities for landmarks
│       │   │   └── FeedbackPanel.jsx    # Per-joint colour-coded feedback list
│       │   │
│       │   ├── meditation/
│       │   │   ├── MeditationTimer.jsx  # Countdown + breathing animation
│       │   │   └── SoundMixer.jsx       # Ambient sound toggle & volume control
│       │   │
│       │   └── store/
│       │       ├── ProductCard.jsx  # Store product tile with add-to-cart
│       │       └── CartDrawer.jsx   # Slide-out cart with checkout
│       │
│       └── pages/
│           ├── PublicLanding.jsx    # Marketing landing page (unauthenticated)
│           ├── DashboardPage.jsx    # Home dashboard: stats, week view, quick actions
│           ├── YogaPage.jsx         # AI yoga session with camera & scoring
│           ├── MeditationPage.jsx   # Meditation category selector + timer
│           ├── StorePage.jsx        # Wellness product catalogue
│           ├── AnalyticsPage.jsx    # Charts: weekly, pose performance, joint heatmap
│           ├── SubscriptionPage.jsx # Plan cards + full feature comparison table
│           ├── ProfilePage.jsx      # User info editor + BMI calculator
│           ├── HelpPage.jsx         # Searchable FAQ accordion
│           ├── ContactPage.jsx      # Contact form with info tiles
│           └── ShopDashboard.jsx    # Shop-owner product inventory CRUD
│
└── server/                          # Node.js + Express backend
    ├── server.js                    # Entry point: Express app, DB connection, routes
    ├── package.json
    ├── .env.example
    │
    ├── models/
    │   ├── User.js                  # User schema (name, email, password, role, coins, profile)
    │   └── Session.js               # Session schema (pose, score, angles, feedback, coins)
    │
    ├── routes/
    │   ├── auth.js                  # POST /register  POST /login  GET /me
    │   ├── pose.js                  # GET /list  GET /standard/:name  POST /evaluate
    │   └── sessions.js              # GET /  GET /analytics  GET /weekly
    │
    ├── controllers/
    │   ├── authController.js        # register, login, getMe handlers
    │   ├── poseController.js        # listPoses, getStandard, evaluate handlers
    │   └── sessionController.js     # getSessions, getAnalytics, getWeekly handlers
    │
    ├── services/
    │   ├── poseService.js           # Weighted scoring engine (evaluatePose)
    │   ├── authService.js           # Token generation, user lookup helpers
    │   └── analyticsService.js      # Aggregation queries for dashboard stats
    │
    ├── middleware/
    │   ├── authMiddleware.js        # JWT Bearer token verifier (protect)
    │   ├── errorHandler.js          # Global error response formatter
    │   └── validate.js             # Request body validation helpers
    │
    └── data/
        └── standardPoses.js        # Ideal joint angles database for all poses
```

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <jwt_token>
```

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create a new account |
| `POST` | `/login` | ❌ | Authenticate and receive a JWT |
| `GET` | `/me` | ✅ | Get the authenticated user's profile |

**POST `/register`** — Request body:
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "securepass123",
  "role": "user"
}
```
Response: `{ token, user }`

**POST `/login`** — Request body:
```json
{
  "email": "priya@example.com",
  "password": "securepass123"
}
```
Response: `{ token, user }`

---

### Pose — `/api/pose`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/list` | ❌ | List all supported pose names and their joints |
| `GET` | `/standard/:poseName` | ❌ | Get ideal angles for a specific pose |
| `POST` | `/evaluate` | ✅ | Submit detected angles, receive score & feedback |

**POST `/evaluate`** — Request body:
```json
{
  "poseName": "Tadasana",
  "duration": 45,
  "angles": {
    "left_knee":      178,
    "right_knee":     176,
    "spine":          182,
    "left_shoulder":  175,
    "right_shoulder": 177,
    "left_elbow":     179,
    "right_elbow":    180
  }
}
```

Response:
```json
{
  "score": 87,
  "status": "excellent",
  "coinsEarned": 6,
  "jointResults": {
    "left_knee": { "userAngle": 178, "ideal": 180, "diff": 2, "score": 100, "status": "green" }
  },
  "feedback": [
    { "joint": "spine", "status": "yellow", "message": "Stand tall — keep your spine perfectly straight", "diff": 2 }
  ]
}
```

---

### Sessions — `/api/sessions`

All session routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Retrieve all sessions for the authenticated user |
| `GET` | `/analytics` | Aggregated stats: summary, weekly, posePerformance, weakestJoints |
| `GET` | `/weekly` | Day-by-day accuracy and duration for the current week |

---

### Health Check

```
GET /api/health
→ { "status": "ok", "ts": "2024-01-01T00:00:00.000Z" }
```

---

## 🎯 Scoring Algorithm

The server-side scoring engine in `server/services/poseService.js` uses a **weighted joint-angle** model:

### Step 1 — Angle Difference
For each detected joint, the absolute difference between the user's measured angle and the standard ideal angle is computed:

```
diff = |userAngle − idealAngle|
```

### Step 2 — Per-Joint Score
```
if diff ≤ tolerance       → jointScore = 100
else                      → jointScore = max(0, 100 − (diff − tolerance) × 2)
```

### Step 3 — Traffic Light Status
```
diff ≤ tolerance          → "green"   ✅
diff ≤ tolerance × 2.5    → "yellow"  ⚠️
else                      → "red"     ❌
```

### Step 4 — Weighted Final Score
Each joint carries a `weight` multiplier (1 = normal, 2 = critical/load-bearing):

```
finalScore = Σ(jointScore × weight) / Σ(weight)
```

### Step 5 — Session Grade & Coins
| Score Range | Status | Coins Earned |
|-------------|--------|-------------|
| ≥ 90 | `excellent` | 🪙 10 |
| 70 – 89 | `good` | 🪙 6 |
| 50 – 69 | `fair` | 🪙 3 |
| < 50 | `needs_work` | 🪙 1 |

### Standard Pose Database (excerpt)

```javascript
// server/data/standardPoses.js
Tadasana: {
  spine:         { ideal: 180, tolerance: 8,  weight: 2, hint: "Stand tall — keep your spine perfectly straight" },
  left_knee:     { ideal: 180, tolerance: 10, weight: 2, hint: "Straighten your left knee fully" },
  left_shoulder: { ideal: 180, tolerance: 12, weight: 1, hint: "Relax your left shoulder downward" },
  // ...
}
```

---

## 🗄️ Data Models

### User
```javascript
{
  name:     String,   // required
  email:    String,   // required, unique, lowercase
  password: String,   // bcrypt-hashed, minlength: 6
  role:     String,   // "user" | "shop"
  coins:    Number,   // default: 0
  profile: {
    age, gender, heightCm, weightKg, targetWeight,
    goal,   // default: "Flexibility"
    level,  // default: "Beginner"
  },
  createdAt, updatedAt  // timestamps
}
```

### Session
```javascript
{
  user:          ObjectId,  // ref: User
  poseName:      String,
  duration:      Number,    // seconds
  score:         Number,    // 0–100
  coins:         Number,
  date:          String,    // "YYYY-MM-DD"
  angles:        Mixed,     // { joint: degrees, ... }
  feedback:      [{
    joint, status,          // "green"|"yellow"|"red"
    message, diff
  }],
  overallStatus: String,    // "excellent"|"good"|"fair"|"needs_work"
  createdAt, updatedAt      // timestamps
}
```

---

## 🧘 Supported Poses

| # | Pose | Sanskrit | Difficulty |
|---|------|----------|-----------|
| 1 | Tadasana | Mountain Pose | Beginner |
| 2 | Bhujangasana | Cobra Pose | Beginner |
| 3 | Vrikshasana | Tree Pose | Intermediate |
| 4 | Trikonasana | Triangle Pose | Intermediate |
| 5 | Adho Mukha Svanasana | Downward Dog | Beginner |
| 6 | Setu Bandhasana | Bridge Pose | Beginner |
| 7 | Balasana | Child's Pose | Beginner |
| 8 | Utkatasana | Chair Pose | Intermediate |
| 9 | Virabhadrasana | Warrior I | Intermediate |
| 10 | Paschimottanasana | Seated Forward Bend | Advanced |

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens signed with `JWT_SECRET`; expiry configurable
- `protect` middleware validates Bearer token on every protected route
- CORS restricted to `CLIENT_URL` (defaults to `http://localhost:5173`)
- Request body size capped at **1 MB**
- Camera data is processed **entirely on the client** via MediaPipe — no video is transmitted to the server


---

## 🙏 Acknowledgements

- [Google MediaPipe](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) — pose landmark detection
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
- [Razorpay](https://razorpay.com) — payment gateway
- [MongoDB Atlas](https://www.mongodb.com/atlas) — cloud database hosting

---

<div align="center">
  Made with 💚 for wellness enthusiasts everywhere
  <br/>
  <sub>YogaAI · React · Node.js · MongoDB · MediaPipe</sub>
</div>