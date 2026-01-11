# Cloud-Based Code Execution Platform 🚀

A powerful, cloud-native online code editor and execution environment (REPL) built with a microservices architecture. It allows users to create, code, and execute projects in isolated containers with real-time feedback, similar to platforms like Replit or CodeSandbox.

---

## 🎯 Key Features

- **⚡ Instant Environments**: Spin up isolated Node.js or Python environments in seconds.
- **🛠️ Rich Code Editor**: Full-featured IDE experience powered by Monaco Editor.
- **💻 Interactive Terminal**: Real-time shell access via xterm.js (sh/bash).
- **☁️ Cloud Persistence**: Automatic file syncing and storage using AWS S3.
- **🛑 Scalable Orchestration**: Dynamic pod management using Kubernetes (K8s).
- **🔄 Real-time Communication**: Low-latency file operations and terminal streaming via WebSockets.
- **🎨 Modern UI**: Sleek, dark-themed interface with responsive side-by-side layout.

---

## 🏗️ Architecture

The system consists of four main components interacting to provide a seamless development experience:

### 1. **Frontend Service** (`/frontend`)
- **Tech Stack**: React, Vite, TypeScript, Emotion, Monaco Editor, Socket.io-client.
- **Port**: `5173` (Development)
- **Role**: User interface for project creation, coding, and terminal interaction.
- **Key Routes**:
    - `/`: Landing page for creating a new REPL.
    - `/coding/?replId=...`: Main IDE workspace.

### 2. **Init Service** (`/init-service`)
- **Tech Stack**: Express, TypeScript, AWS SDK.
- **Port**: `3001` (Default)
- **Role**: Handles the initial creation of projects.
- **Endpoints**:
    - `POST /project`: Accepts `replId` and `language`. Copies the base language template from S3 to the project's S3 folder (`code/{replId}`).

### 3. **Orchestrator Service** (`/orchestrator-simple`)
- **Tech Stack**: Express, TypeScript, Kubernetes Client (`@kubernetes/client-node`).
- **Port**: `3002` (Default)
- **Role**: Manages the lifecycle of user containers (pods).
- **Endpoints**:
    - `POST /start`: Accepts `replId`. Creates a K8s Deployment, Service, and Ingress for that specific project.

### 4. **Runner Service** (`/runner`)
- **Tech Stack**: Node.js, Express, Socket.io, Node-pty, AWS SDK.
- **Port**: `3001` (Runs inside the User Pod)
- **Role**: The actual execution environment. It runs inside the generated K8s pod.
    - Manages the pseudo-terminal (PTY) session.
    - Handles file system operations (read/write).
    - Syncs files between the container and S3.

---

## 🔄 System Flow

1.  **Project Creation**: 
    - User enters a name and selecting a language on the **Frontend**.
    - Frontend calls **Init Service** (`POST /project`).
    - **Init Service** copies the language template (e.g., `base/python`) to the user's S3 directory used for persistence.

2.  **Environment Boot**:
    - Frontend redirects to the Coding Page.
    - Frontend calls **Orchestrator** (`POST /start`).
    - **Orchestrator** talks to the **Kubernetes API** to create a Pod running the **Runner Service**.
    - An *Init Container* in the Pod downloads the user's code from S3 to the container's volume.

3.  **Connection & Coding**:
    - Once the Pod is ready, Frontend connects to the **Runner** via **WebSockets**.
    - **Runner** sends the file tree.
    - **File Edits**: Changes are sent to Runner, which writes to disk and syncs updates back to S3.
    - **Terminal**: Commands (e.g., `npm start`, `python main.py`) are sent via socket, executed by `node-pty`, and output is streamed back.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Kubernetes Cluster (Minikube, Docker Desktop, or Cloud Provider)
- AWS Account (for S3)

### 1. Configuration (Environment Variables)

Create `.env` files in `init-service`, `orchestrator-simple`, and `runner` (or configure your K8s deployment) with the following:

```env
PORT=3001 (or 3002 for orchestrator)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your_s3_bucket_name
# Optional: S3_ENDPOINT if using MinIO or compatible storage
```

### 2. S3 Setup
Ensure your S3 bucket has a `base/` directory containing your language templates:
- `s3://your-bucket/base/node-js/`
- `s3://your-bucket/base/python/`

### 3. Installation & Local Development

Run the following in separate terminals:

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

**Init Service**:
```bash
cd init-service
npm install
npm run dev
```

**Orchestrator Service**:
```bash
cd orchestrator-simple
npm install
npm run dev
```

*Note: The **Runner Service** is designed to run inside Kubernetes. For local listing, you may need to mock the connection or manually build/run the Docker image.*

### 4. Kubernetes Deployment (Orchestrator)

Update `orchestrator-simple/service.yaml` with your generic pod configuration and AWS credentials (or use K8s secrets).

---

## 📡 WebSocket Events (Runner)

| Event Name | Direction | Payload | Description |
|:--- |:--- |:--- |:--- |
| `loaded` | Server -> Client | `{ rootContent: RemoteFile[] }` | Emitted when connection is established and files are loaded. |
| `fetchDir` | Client -> Server | `path: string` | Requests contents of a directory. Callback returns `files`. |
| `fetchContent` | Client -> Server | `{ path: string }` | Requests content of a specific file. |
| `updateContent` | Client -> Server | `{ path: string, content: string }` | Saves new content to file and syncs to S3. |
| `requestTerminal` | Client -> Server | `{}` | Requests creation of a PTY session. |
| `terminalData` | Client -> Server | `{ data: string }` | Sends input (keystrokes/commands) to the terminal. |
| `terminal` | Server -> Client | `{ data: Buffer }` | Streamed output from the terminal process. |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.
