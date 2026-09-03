# AegisFace Mobile Application (`frontend/`)

The **AegisFace** mobile application is a high-performance, offline-first facial recognition and biometric liveness detection client designed for NHAI field personnel working in zero-connectivity remote areas.

---

## Architecture Highlights

- **Framework**: React Native 0.81 + Expo 54 with TypeScript.
- **Styling**: NativeWind (TailwindCSS 3.4) with custom UI system (Glassmorphic cards, Aegis Shield, Orb animations).
- **On-Device Face Detection**: BlazeFace / MediaPipe TFLite model (~230 KB).
- **On-Device Feature Extraction**: MobileFaceNet ArcFace-trained quantized model (~5.2 MB) generating 128-d / 512-d embeddings.
- **Biometric Liveness Engine**: Active spoof-prevention challenges (Blink via EAR, Smile, Head Turn/Yaw pose).
- **Offline Storage**: Encrypted local embeddings and queued attendance transactions (AES-256 / SecureStore / MMKV).
- **Auto-Sync Engine**: Background syncing when network connectivity is restored, followed by secure local record purge.

---

## Directory Layout

```
frontend/
├── assets/                   # App icons, splash screens, and TFLite ML models
│   ├── models/               # On-device .tflite models (face_detector, mobilefacenet)
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash.png
├── src/
│   ├── components/           # Reusable UI & camera overlay components
│   │   ├── camera/           # AegisOrb, FaceBoundingBox, QualityHUD
│   │   ├── liveness/         # ChallengeCard, ChallengeProgress
│   │   └── ui/               # AegisShield, ConfidenceMeter, GlassCard, ParticleField
│   ├── hooks/                # Custom hooks (camera, haptics, liveness, ambient light, sync)
│   ├── lib/                  # Crypto, ML helpers, offline sync queue, constants
│   ├── navigation/           # Root, MainTab, and Onboarding navigators
│   ├── screens/              # Core screens (Dashboard, Enrollment, Sentinel, History, etc.)
│   ├── services/             # Verification pipeline, landmark analysis, backend sync
│   ├── storage/              # Encrypted biometric storage
│   ├── store/                # Zustand stores (auth, enrollment, verification, settings)
│   ├── types/                # TypeScript interfaces & navigation types
│   └── utils/                # Formatters, color constants, animations
├── App.tsx                   # Main React Native root component
├── index.ts                  # App entry point
├── app.json                  # Expo config
├── babel.config.js           # Babel & module aliases (@components, @services, etc.)
├── metro.config.js           # Metro bundler config
├── tailwind.config.js        # NativeWind Tailwind config
└── tsconfig.json             # TypeScript compiler config
```

---

## Setup & Running Locally

### 1. Install Dependencies
From the repository root:
```bash
npm --prefix frontend install
```
Or within the `frontend/` directory:
```bash
cd frontend
npm install
```

### 2. Start the Expo Development Server
```bash
npm start
```

### 3. Running on Devices / Simulators
- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web preview**: `npm run web`

---

## Key Modules & Path Aliases

All modules utilize path aliases configured in `tsconfig.json` and `babel.config.js`:
- `@components/*` -> `src/components/*`
- `@screens/*` -> `src/screens/*`
- `@hooks/*` -> `src/hooks/*`
- `@store/*` -> `src/store/*`
- `@lib/*` -> `src/lib/*`
- `@types/*` -> `src/types/*`
- `@services/*` -> `src/services/*`
- `@storage/*` -> `src/storage/*`
- `@utils/*` -> `src/utils/*`
- `@assets/*` -> `assets/*`
