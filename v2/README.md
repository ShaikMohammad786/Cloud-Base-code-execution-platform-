<div align="center">

# ☁️ CloudCode

### Cloud-Based Code Execution Platform with Real-Time Collaboration

A full-stack, production-grade cloud IDE that gives every user an isolated Linux development environment — right in their browser.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazon-s3&logoColor=white)](https://aws.amazon.com/s3/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Service Details](#-service-details)
- [API Reference](#-api-reference)
- [How It Works](#-how-it-works)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**CloudCode** is a cloud-based code execution platform inspired by Replit, built with a microservices architecture. Each user gets an **isolated Kubernetes pod** running a full Linux environment with a terminal, file system, and VS Code-grade editor — all accessible through a browser.

### Why This Project?

- **No Local Setup** — Users write and run code without installing anything
- **Real-Time Collaboration** — Multiple users edit the same file simultaneously with live cursors
- **Container Isolation** — Every project runs in its own Kubernetes pod for security
- **Persistent Storage** — Code is synced to AWS S3 and restored on next session
- **Production Architecture** — Microservices, JWT auth, WebSocket communication, Kubernetes orchestration

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                            │
│  Landing Page → Auth → Dashboard → Coding Page (Monaco + Terminal)  │
└────────┬──────────────┬──────────────┬──────────────┬───────────────┘
         │              │              │              │
    REST/HTTP      REST/HTTP      REST/HTTP     WebSocket (Yjs)
         │              │              │              │
    ┌────▼────┐   ┌─────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
    │  Auth   │   │   Init    │  │Orchestr- │  │  Collab  │
    │ Service │   │  Service  │  │  ator    │  │  Server  │
    │ :3003   │   │  :3001    │  │  :3002   │  │  :4444   │
    └────┬────┘   └─────┬─────┘  └────┬─────┘  └──────────┘
         │              │              │
    SQLite DB      AWS S3         Kubernetes API
                   Bucket         ┌──────────────┐
                                  │  K8s Cluster  │
                                  │  ┌──────────┐ │
                                  │  │ Runner   │ │
                                  │  │ Pod      │ │
                                  │  │ :3001 WS │ │
                                  │  │ :3000 App│ │
                                  │  └──────────┘ │
                                  └──────────────┘
```

### Request Flow

```
User clicks "New Project"
  → Frontend POST /api/projects (Auth Service) — saves to DB
  → Frontend POST /start (Orchestrator) — creates K8s Deployment + Service + Ingress
  → Frontend POST /project (Init Service) — copies boilerplate to S3
  → K8s Pod starts → Init container pulls code from S3 → Runner starts
  → Frontend connects via WebSocket to runner pod
  → User sees file tree, editor, terminal — all live
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework with hooks |
| **TypeScript** | Type-safe development |
| **Monaco Editor** | VS Code-powered code editor |
| **xterm.js** | Terminal emulator in the browser |
| **Yjs + y-monaco** | CRDT-based real-time collaboration |
| **Emotion (styled)** | CSS-in-JS styling |
| **Socket.IO Client** | WebSocket communication |
| **React Router v6** | Client-side routing |
| **JSZip** | Client-side ZIP download |

### Backend Services
| Service | Technology | Purpose |
|---|---|---|
| **Auth Service** | Express + Passport + SQLite | OAuth (Google/GitHub), JWT, project CRUD |
| **Init Service** | Express + AWS SDK | S3 file initialization, boilerplate copy |
| **Orchestrator** | Express + @kubernetes/client-node | K8s pod lifecycle management |
| **Collab Server** | y-websocket + WebSocket | Real-time collaboration relay |
| **Runner** | Express + Socket.IO + node-pty | In-pod file system + terminal |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Kubernetes** | Container orchestration |
| **Docker** | Runner container image |
| **Minikube** | Local K8s cluster |
| **NGINX Ingress** | Per-pod hostname routing |
| **AWS S3** | Persistent code storage |

---

## ✨ Features

### 🔐 Authentication
- Google OAuth 2.0 login
- GitHub OAuth 2.0 login
- JWT-based cross-service authentication
- Session management with auto-refresh

### 📁 Project Management
- Create new projects (Node.js / Python)
- Clone GitHub repositories
- Delete projects with pod cleanup
- Project heartbeat tracking
- Active/inactive status badges

### 💻 Code Editor
- Monaco Editor (VS Code engine)
- Syntax highlighting for 20+ languages
- IntelliSense & autocomplete
- Ctrl+S instant save
- File tree with create / rename / delete
- Multi-file support

### 🖥 Terminal
- Full Linux terminal (bash)
- Multiple terminal tabs
- Real PTY (node-pty) — not emulated
- Run any command: npm, python, git, etc.

### 👥 Real-Time Collaboration
- Click "Collaborate" → get shareable link
- Live cursor positions & selections
- User presence indicators (avatars)
- Stop collaboration anytime
- Auto-join via shared link

### 📦 Additional Features
- Download project as ZIP
- Clone from GitHub URL
- Step-by-step pod startup progress
- Professional styled modals (no browser prompts)
- Responsive design
- Custom scrollbars & focus states
- Premium landing page

---

## 📂 Project Structure

```
Cloud Based code Execution/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.tsx          # Premium landing page
│   │   │   ├── LoginPage.tsx        # OAuth login page
│   │   │   ├── Dashboard.tsx        # Project management dashboard
│   │   │   ├── CodingPage.tsx       # Main IDE (editor + terminal + sidebar)
│   │   │   ├── CollabPresence.tsx   # Collaboration presence indicators
│   │   │   ├── Modals.tsx           # Styled PromptModal & ConfirmModal
│   │   │   ├── NewProjectModal.tsx  # New project creation modal
│   │   │   ├── Output.tsx           # Port 3000 preview iframe
│   │   │   ├── TerminalPanel.tsx    # Multi-tab terminal component
│   │   │   └── external/editor/     # File tree, sidebar, Monaco editor
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # JWT auth context provider
│   │   ├── hooks/
│   │   │   └── useCollaboration.ts   # Yjs collaboration hook
│   │   ├── App.tsx                   # Router & protected routes
│   │   ├── index.css                 # Global styles & CSS variables
│   │   └── App.css                   # xterm.js styles
│   ├── index.html
│   └── package.json
│
├── auth-service/                # Authentication & project database
│   └── src/
│       ├── index.ts                 # Express server (port 3003)
│       ├── db.ts                    # SQLite database (users + projects)
│       ├── auth.ts                  # Passport Google/GitHub strategies
│       ├── middleware/
│       │   └── verify-jwt.ts        # JWT verification middleware
│       └── routes/
│           ├── auth-routes.ts       # OAuth login/callback endpoints
│           └── project-routes.ts    # Project CRUD API
│
├── init-service/                # File initialization service
│   └── src/
│       ├── index.ts                 # Express server (port 3001)
│       ├── aws.ts                   # S3 client configuration
│       └── templates/               # Language boilerplate files
│
├── orchestrator-simple/         # Kubernetes orchestration
│   └── src/
│       ├── index.ts                 # Express server (port 3002)
│       ├── cleanup.ts               # Cron job for stale pod cleanup
│       ├── middleware/
│       │   └── verify-jwt.ts        # JWT verification
│       └── service.yaml             # K8s Deployment + Service + Ingress template
│
├── collab-server/               # Real-time collaboration relay
│   └── src/
│       └── index.js                 # y-websocket server (port 4444)
│
├── runner/                      # Runs inside each K8s pod
│   ├── src/
│   │   ├── index.ts                 # Entry point
│   │   ├── ws.ts                    # Socket.IO server (file ops + terminal)
│   │   ├── fs.ts                    # File system operations
│   │   ├── pty.ts                   # Terminal manager (node-pty)
│   │   └── aws.ts                   # S3 sync for persistence
│   └── Dockerfile                   # Runner container image
│
└── setup-minikube.ps1           # One-click Minikube setup script
```

---

## 📋 Prerequisites

Before running CloudCode, ensure you have the following installed:

| Tool | Version | Installation |
|---|---|---|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Minikube** | Latest | `winget install Kubernetes.minikube` |
| **kubectl** | Latest | `winget install Kubernetes.kubectl` |
| **AWS CLI** | v2 | `winget install Amazon.AWSCLI` |

### Accounts Required
- **Google Cloud Console** — for OAuth Client ID/Secret
- **GitHub Developer Settings** — for OAuth App
- **AWS Account** — for S3 bucket

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/ShaikMohammad786/Cloud-Base-code-execution-platform-.git
cd "Cloud Based code Execution"
```

### Step 2: Install Dependencies

```bash
# Frontend
cd frontend && npm install && cd ..

# Auth Service
cd auth-service && npm install && cd ..

# Init Service
cd init-service && npm install && cd ..

# Orchestrator
cd orchestrator-simple && npm install && cd ..

# Collab Server
cd collab-server && npm install && cd ..
```

### Step 3: Configure Environment Variables

#### Auth Service (`auth-service/.env`)
```env
PORT=3003
SESSION_SECRET=your_session_secret
JWT_SECRET=cloudcode_jwt_secret_2024
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:5173
```

#### Init Service (`init-service/.env`)
```env
PORT=3001
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-north-1
S3_BUCKET=cloudcoderepl
```

### Step 4: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect URI: `http://localhost:3003/auth/google/callback`
5. Copy Client ID and Client Secret to `.env`

### Step 5: Set Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. Authorization callback URL: `http://localhost:3003/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### Step 6: Set Up Minikube & Kubernetes

```powershell
# Start Minikube with Docker driver
minikube start --driver=docker --cpus=4 --memory=4096

# Enable Ingress controller
minikube addons enable ingress

# Point Docker to Minikube's daemon (for building runner image)
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Build the Runner Docker image
cd runner
docker build -t skmohammad/runner:latest .
cd ..

# Start Minikube tunnel (run as Administrator, keep open)
minikube tunnel
```

### Step 7: Add Hosts File Entries

> **Note:** The orchestrator auto-adds hosts entries for new projects, but it needs to be run as Administrator. Alternatively, add entries manually.

Open `C:\Windows\System32\drivers\etc\hosts` as Administrator and add:

```
127.0.0.1 your-project-name.cloudcode.local
127.0.0.1 your-project-name.cloudcodeterminal.local
```

---

## ▶️ Running the Application

Open **5 separate terminals** and run each service:

```bash
# Terminal 1 — Auth Service (port 3003)
cd auth-service && npm run dev

# Terminal 2 — Init Service (port 3001)
cd init-service && npm run dev

# Terminal 3 — Orchestrator (port 3002) ⚠️ Run as Administrator
cd orchestrator-simple && npm run dev

# Terminal 4 — Collab Server (port 4444)
cd collab-server && npm run dev

# Terminal 5 — Frontend (port 5173)
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 Service Details

### Auth Service (`:3003`)
Handles user authentication and project metadata storage.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/auth/google` | GET | No | Start Google OAuth flow |
| `/auth/google/callback` | GET | No | Google OAuth callback → JWT |
| `/auth/github` | GET | No | Start GitHub OAuth flow |
| `/auth/github/callback` | GET | No | GitHub OAuth callback → JWT |
| `/auth/me` | GET | JWT | Get current user info |
| `/api/projects` | GET | JWT | List user's projects |
| `/api/projects` | POST | JWT | Create new project |
| `/api/projects/:replId` | DELETE | JWT | Delete project |
| `/api/projects/:replId/heartbeat` | POST | JWT | Update last accessed time |
| `/api/projects/:replId/activate` | PATCH | No | Mark project as active |
| `/api/projects/:replId/deactivate` | PATCH | No | Mark project as inactive |

### Init Service (`:3001`)
Initializes project files in S3 with language-specific boilerplate.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/project` | POST | JWT | Create project files in S3 |
| `/clone` | POST | JWT | Register clone operation |

### Orchestrator (`:3002`)
Manages Kubernetes pod lifecycle.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/start` | POST | JWT | Create K8s Deployment + Service + Ingress |
| `/stop` | POST | JWT | Delete K8s resources |
| `/status/:replId` | GET | No | Check if pod is running |

### Collab Server (`:4444`)
WebSocket relay for Yjs CRDT documents.

### Runner (inside K8s pod `:3001`)
Socket.IO server for file operations and terminal.

| Socket Event | Direction | Description |
|---|---|---|
| `loaded` | Server → Client | File tree loaded, sends root contents |
| `fetchDir` | Client → Server | Request directory contents |
| `fetchContent` | Client → Server | Request file content |
| `updateContent` | Client → Server | Save file + sync to S3 |
| `createFile` | Client → Server | Create new file |
| `createFolder` | Client → Server | Create new folder |
| `deleteItem` | Client → Server | Delete file/folder |
| `renameItem` | Client → Server | Rename file/folder |
| `gitClone` | Client → Server | Clone GitHub repo into workspace |
| `createTerminal` | Client → Server | Spawn new PTY terminal |
| `terminalData` | Bidirectional | Terminal I/O data |
| `closeTerminal` | Client → Server | Kill terminal session |

---

## 🔄 How It Works

### 1. Authentication Flow
```
User clicks "Sign in with Google"
  → Redirect to Google OAuth consent screen
  → Google redirects to /auth/google/callback
  → Auth Service creates/finds user in SQLite
  → Generates JWT with {userId, email, name, avatar}
  → Redirects to frontend /auth/callback?token=<jwt>
  → Frontend stores JWT in localStorage
  → All subsequent API calls include Authorization: Bearer <jwt>
```

### 2. Project Creation Flow
```
User clicks "New Project" → selects language
  → POST /api/projects (Auth) — saves metadata to SQLite
  → POST /project (Init) — copies boilerplate to S3://cloudcoderepl/code/{replId}/
  → Navigate to /coding?replId={replId}
  → POST /start (Orchestrator) — creates K8s resources:
      • Deployment (runner pod with init container)
      • Service (ports 3001 + 3000)
      • Ingress ({replId}.cloudcode.local)
  → Init container: aws s3 cp s3://bucket/code/{replId}/ /workspace/ --recursive
  → Runner starts, WebSocket server listens on :3001
  → Frontend connects via Socket.IO
  → Runner emits 'loaded' with file tree
  → User sees editor + terminal
```

### 3. Real-Time Collaboration Flow
```
User A clicks "Collaborate" → generates share link
  → Yjs WebSocket connects to collab server (:4444)
  → Room name = "code-{replId}-{filePath}"
  → MonacoBinding syncs editor ↔ Y.Text
  → User A copies link, sends to User B
  → User B opens link → auto-joins same Yjs room
  → Both editors stay in sync via CRDT
  → Awareness protocol shows cursors + presence
```

### 4. File Persistence Flow
```
User edits file → onChange fires after 500ms debounce
  → Socket emits 'updateContent' {path, content}
  → Runner writes to /workspace/{path}
  → Runner syncs to S3: s3://bucket/code/{replId}/{path}
  → On next session, init container restores from S3
```

### 5. Pod Cleanup Flow
```
Orchestrator runs cleanup cron every 5 minutes
  → Fetches active projects from Auth Service
  → Checks last heartbeat timestamp
  → If idle > 30 minutes:
      • Deletes K8s Deployment + Service + Ingress
      • Marks project as inactive in Auth DB
```

---

## 🔒 Security

- **Container Isolation** — Each user's code runs in a separate Kubernetes pod
- **JWT Authentication** — Stateless, signed tokens with expiry
- **OAuth 2.0** — No passwords stored, delegated to Google/GitHub
- **CORS** — Restricted to frontend origin
- **Resource Limits** — CPU (500m) and memory (512Mi) per pod

---

## 🎨 UI/UX Highlights

- **Dark theme** with glassmorphism effects
- **Custom styled modals** — no browser `alert`/`prompt`/`confirm`
- **Step-by-step progress** for pod startup & git clone
- **Animated landing page** with floating orbs & terminal mockup
- **Custom scrollbars** with dark theme
- **Keyboard shortcuts** (Ctrl+S to save)
- **Responsive layout** for all screen sizes

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ by Mohammad**

[⬆ Back to Top](#-cloudcode)

</div>
