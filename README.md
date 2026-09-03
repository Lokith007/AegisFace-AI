# AegisFace-AI — NHAI Offline Facial Recognition Attendance System

[![NHAI Hackathon 7.0](https://img.shields.io/badge/NHAI_Hackathon-7.0-blue.svg)](./docs/hackathon_doc7.pdf)
[![Frontend](https://img.shields.io/badge/Frontend-React_Native_%7C_Expo_54-61DAFB.svg)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js_22_%7C_Express_%7C_SQLite-339933.svg)](./backend)
[![AI Engine](https://img.shields.io/badge/AI_Engine-MobileFaceNet_%7C_BlazeFace-FF6F00.svg)](./frontend/assets/models)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**AegisFace-AI** is a mission-critical, offline-first biometric attendance management platform engineered for **National Highways Authority of India (NHAI)** field personnel working in zero-connectivity remote project sites (highways, tunnels, bridge construction corridors).

The system enables **100% offline biometric verification** on field mobile devices, utilizing quantized deep learning models and active 3D liveness detection. When field personnel return to network coverage, attendance records are securely synced to the centralized NHAI Datalake backend and automatically purged from the edge device.

---

## Repository Structure

The project is structured as a clean, decoupled monorepo:

```
c:\nhai\ (AegisFace-AI)
├── frontend/                     # React Native (Expo) Mobile Application
│   ├── assets/                   # App icons, splash screens, and TFLite ML models
│   │   └── models/               # On-device AI models (face_detector, mobilefacenet)
│   ├── src/                      # Mobile app source code
│   │   ├── components/           # UI, Camera (AegisOrb, QualityHUD), & Liveness cards
│   │   ├── hooks/                # Camera, liveness, ambient light & sync hooks
│   │   ├── lib/                  # Crypto (AES), ML helpers, and offline sync queue
│   │   ├── navigation/           # Root, MainTab, and Onboarding navigators
│   │   ├── screens/              # Screens (Dashboard, Enrollment, Sentinel, History)
│   │   ├── services/             # Verification pipeline, landmark analysis, backend sync
│   │   ├── storage/              # Encrypted biometric storage (SecureStore / MMKV)
│   │   ├── store/                # Zustand state stores
│   │   ├── types/                # TypeScript interfaces & definitions
│   │   └── utils/                # UI formatters, color palette, animations
│   ├── App.tsx                   # Main React Native root component
│   ├── app.json                  # Expo application configuration
│   ├── babel.config.js           # Babel config & path aliases
│   ├── metro.config.js           # Metro bundler config
│   ├── tailwind.config.js        # NativeWind / Tailwind styling config
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   └── README.md                 # Frontend-specific setup and guide
│
├── backend/                      # Central Datalake Sync Backend (Node.js/Express)
│   ├── src/                      # Backend TypeScript source code
│   │   ├── auth/                 # JWT & Device API Key authentication
│   │   ├── routes/               # API endpoints (auth, sync, enrollments, health)
│   │   ├── scripts/              # Seed & migration scripts
│   │   ├── app.ts                # Express application setup
│   │   ├── config.ts             # Environment configuration & validation
│   │   ├── db.ts                 # SQLite database layer (node:sqlite)
│   │   ├── server.ts             # HTTP server entry point
│   │   ├── startup.ts            # Boot bootstrap & demo data seeding
│   │   └── types.ts              # Backend TypeScript types
│   ├── tests/                    # Jest test suites (auth, sync, enrollments, health)
│   ├── uploads/                  # Profile photo storage
│   ├── jest.config.js            # Jest testing configuration
│   ├── railway.json              # Railway deployment config
│   ├── tsconfig.json             # Backend TypeScript configuration
│   ├── tsconfig.build.json       # Production build TS configuration
│   ├── .env.example              # Environment variables template
│   └── README.md                 # Backend API documentation
│
├── docs/                         # Documentation & Architecture Guides
│   ├── hackathon_doc7.pdf        # NHAI Hackathon 7.0 Problem Statement
│   ├── BUILD_GUIDE.md            # Technical architecture & stack rationale
│   └── ARCHITECTURE.md           # End-to-end pipeline, liveness engine & security
│
├── .gitignore                    # Master root .gitignore
├── package.json                  # Monorepo workspace orchestrator
├── render.yaml                   # Cloud deployment blueprint (Render)
└── README.md                     # This master documentation file
```

---

## Tech Stack Overview

| Domain | Technology | Purpose |
|---|---|---|
| **Mobile App** | React Native 0.81 + Expo 54 | Cross-platform offline mobile application |
| **Mobile Styling** | NativeWind + TailwindCSS 3.4 | Modern glassmorphic and high-contrast dark UI |
| **Face Detection** | BlazeFace (TFLite, ~230 KB) | On-device face localization (< 20 ms) |
| **Face Recognition** | MobileFaceNet (TFLite, ~5.2 MB) | On-device 128/512-d feature embeddings (> 95% accuracy) |
| **Liveness Engine** | MediaPipe Face Mesh (EAR / Yaw) | Spoof detection (blink, smile, head turns) |
| **Local Storage** | Encrypted SQLite + MMKV + SecureStore | Biometrics stored encrypted at rest with AES-256 |
| **Backend API** | Node.js 22 + Express 4 + TypeScript | Central Datalake sync server |
| **Database** | Embedded `node:sqlite` | Zero-native-dependency embedded SQL datalake |
| **Cloud Hosting** | Render / Railway / AWS | Cloud sync & admin dashboard deployment |

---

## Quick Start Guide

### Prerequisites
- Node.js >= 22.5.0
- npm >= 10.0.0
- Expo Go app or Android Studio / Xcode for simulator runs

### 1. Installation
Install dependencies for both frontend and backend in one command from the project root:
```bash
npm run install:all
```
*(Or install them individually via `npm --prefix frontend install` and `npm --prefix backend install`)*

---

### 2. Running the Backend Server
Start the local Express sync backend:
```bash
npm run start:backend
```
The server will start at `http://localhost:3000` with the health endpoint live at `http://localhost:3000/api/v1/health`.

To seed demo employee profiles and attendance data:
```bash
npm run seed:backend
```

---

### 3. Running the Mobile Application
Start the Expo development server:
```bash
npm run start:frontend
```
Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code using the Expo Go mobile app.

---

### 4. Running Backend Tests
Execute the Jest automated test suite:
```bash
npm run test:backend
```

---

## Monorepo Command Reference

All primary commands can be run directly from the workspace root:

| Command | Description |
|---|---|
| `npm run install:all` | Installs dependencies for both `frontend` and `backend` |
| `npm run start:frontend` | Launches the React Native Expo bundler |
| `npm run start:backend` | Starts the Node.js Express sync server with hot-reload |
| `npm run build:backend` | Compiles the backend TypeScript into `dist/` |
| `npm run test:backend` | Executes backend Jest unit and integration tests |
| `npm run seed:backend` | Seeds mock employees, admin users, and attendance records |
| `npm run typecheck` | Type-checks both frontend and backend codebases |
| `npm run lint:frontend` | Runs ESLint across the mobile application source |

---

## Documentation Links

- [System Architecture & Liveness Design](docs/ARCHITECTURE.md)
- [Hackathon Build Guide & Rationale](docs/BUILD_GUIDE.md)
- [Frontend Mobile App Guide](frontend/README.md)
- [Backend API Specification & Endpoints](backend/README.md)
- [NHAI Hackathon 7.0 Problem Statement (PDF)](docs/hackathon_doc7.pdf)

---

## License

This project is developed for the **NHAI Hackathon 7.0** under the MIT License.
