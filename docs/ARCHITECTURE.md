# AegisFace-AI Architecture & System Design

**Project**: NHAI Hackathon 7.0 — Offline-First Facial Recognition Attendance System  
**System Name**: AegisFace-AI / Datalake 3.0 Integration  

---

## 1. System Overview

AegisFace is an enterprise-grade, offline-first biometric attendance management system engineered specifically for NHAI field personnel operating in remote, zero-connectivity environments (e.g., highway construction corridors, mountain passes, rural tunnels).

The system operates across two decoupled layers:
1. **Edge Client (`frontend/`)**: React Native mobile app executing local on-device neural inference (face detection & feature embedding extraction) and dynamic 3D liveness spoof challenges without relying on any network connection.
2. **Central Sync Backend (`backend/`)**: Node.js/Express server backed by embedded SQLite, managing user authentication, cryptographic device pairing, employee master rosters, faceprint template backups, and batch attendance ingestion with automated local-purge acknowledgements.

---

## 2. End-to-End Attendance Pipeline

```
  +-------------------------------------------------------------------------+
  |                          FIELD DEVICE (OFFLINE)                         |
  |                                                                         |
  |  +----------------+      +--------------------+      +---------------+  |
  |  | Live Camera    | ---> | Face Detection     | ---> | Liveness      |  |
  |  | Vision Stream  |      | (BlazeFace TFLite) |      | Engine        |  |
  |  +----------------+      +--------------------+      +---------------+  |
  |                                                              |          |
  |                                                              v          |
  |  +----------------+      +--------------------+      +---------------+  |
  |  | Attendance Log | <--- | Cosine Similarity  | <--- | MobileFaceNet |  |
  |  | (Encrypted DB) |      | Matching (>95%)    |      | (ArcFace 5MB) |  |
  |  +----------------+      +--------------------+      +---------------+  |
  +-------------------------------------------------------------------------+
                                     |
                         [Network Restored in Camp]
                                     |
                                     v
  +-------------------------------------------------------------------------+
  |                           NHAI DATALAKE BACKEND                         |
  |                                                                         |
  |  +------------------+      +--------------------+      +--------------+ |
  |  | Batch Sync API   | ---> | Device Signature   | ---> | Datalake DB  | |
  |  | /api/v1/sync     |      | Verification       |      | Ingestion    | |
  |  +------------------+      +--------------------+      +--------------+ |
  |                                                              |          |
  |                                                              v          |
  |                                                        +--------------+ |
  |                                                        | Ack & Purge  | |
  |                                                        | Signal Sent  | |
  |                                                        +--------------+ |
  +-------------------------------------------------------------------------+
```

---

## 3. Biometric & AI Architecture

### 3.1 Model Specifications
- **Face Detector**: BlazeFace quantized TFLite (`~230 KB`). Detects face boundaries, anchor keypoints, and calculates bounding box framing quality in < 20 ms.
- **Feature Extractor**: MobileFaceNet (`~5.2 MB`). ArcFace trained deep convolutional neural network producing a compact, highly discriminative L2-normalized embedding vector.
- **Threshold Matching**: Matches are calculated via Cosine Distance:
  $$\text{Similarity}(u, v) = \frac{u \cdot v}{\|u\|_2 \|v\|_2}$$
  A similarity score $\ge 0.65$ corresponds to $> 95\%$ verification confidence.

### 3.2 Dynamic Liveness & Anti-Spoofing
To prevent presentation attacks (printed photographs, 3D masks, digital screen replays), the app executes active liveness verification:
- **Eye Aspect Ratio (EAR) Blink Detection**: Tracks landmark distances across upper and lower eyelids.
- **Facial Landmark Smile Detection**: Tracks mouth corner separation distance.
- **Head Pose / Yaw Estimation**: Validates angular head turning using nose and eye alignment.
- **Challenge Randomization**: Challenges are randomly generated per session, defeating pre-recorded spoof attacks.

---

## 4. Security & Cryptographic Architecture

1. **Biometrics at Rest**: Raw biometric images are discarded immediately after embedding generation. Embeddings are stored encrypted with AES-256-GCM using hardware-backed keystore credentials (Expo SecureStore / KeyStore / Keychain).
2. **Device Authentication**: Field devices authenticate to the sync backend using bcrypt-hashed high-entropy API keys issued by administrators.
3. **Admin & Operator RBAC**: Centralized dashboard endpoints are protected by signed JWTs with short expiry and role-based policy enforcement (`admin`, `operator`, `field`).
4. **Sync & Purge Protocol**: Local logs are flagged as `SYNCED` only upon receiving a cryptographically verified server response payload, after which the local raw cache is securely overwritten and purged.
