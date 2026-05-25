# Cloud-Based Code Execution Platform 🚀

> **A scalable, cloud-native online IDE and code execution environment designed for modern developers.**

This platform functionality mimics huge industry players like **Replit**, **CodeSandbox**, and **GitHub Codespaces**. It provides users with instant, isolated coding environments where they can write code, run it in a real terminal, and see the output immediately—all within their browser.

---


## 🎯 Overview

Building a cloud IDE is complex because it requires executing untrusted user code securely. This platform solves that challenge by using **Kubernetes** to spin up a new, isolated **Docker container (Pod)** for *every single project*.

When a user creates a project (Repl), the system:
1.  **Orchestrates**: Provisions a fresh K8s Pod.
2.  **Initializes**: Pulls the user's code from AWS S3 into the Pod.
3.  **Connects**: Establishes a WebSocket connection for real-time file editing and terminal access.

---

## ✨ Key Features

### 🎨 Frontend
- **Monaco Editor Integration**: The same editor engine that powers VS Code.
- **Xterm.js Terminal**: A full-featured, interactive terminal in the browser.
- **Side-by-Side Layout**: Responsive design (Editor | Terminal) for productivity.
- **Multi-language**: Supports `Node.js` and `Python`.

### ⚙️ Backend & Infrastructure
- **Container Isolation**: Each session runs in its own generic Docker container.
- **Dynamic Ingress**: Uses Nginx Ingress Controller to route traffic via subdomains.
- **Persistent Storage**: All code is seamlessly synced to **AWS S3**.
- **Dual-Domain Security**: Separates the IDE environment from the User's running application Output.

---

## 🏗️ System Architecture

### High-Level Design

The system follows an **Event-Drive Microservices Architecture**.

1.  **User** visits the Frontend.
2.  **Frontend** asks **Init Service** to create a project record (folder in S3).
3.  **Frontend** asks **Orchestrator** to spin up computing resources.
4.  **Orchestrator** instructs **Kubernetes** to deploy a `Runner` Pod.
5.  **Frontend** connects directly to the `Runner` Pod via WebSockets.

### Microservices Breakdown

| Service | Path | Port | Tech Stack | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `/frontend` | `5173` | React, Vite, TS | User Interface. Connects via WebSocket. |
| **Init Service** | `/init-service` | `3001` | Express, AWS SDK | "Control Plane". Handles S3 template creation. |
| **Orchestrator** | `/orchestrator` | `3002` | Express, K8s Client | "Infrastructure Plane". Manages K8s Pods. |
| **Runner** | `/runner` | `3001` | Node.js, Socket.io | "Data Plane". Runs *inside* the user's Pod. |

### Network & Domain Architecture

This project uses a **Dual-Domain Strategy** to isolate the IDE communication from the user's running application (like a preview window).

1.  **IDE Connection (`*.cloudcode.work.gd`)**:
    *   **Port 3001**
    *   Used for **WebSockets** (File editing, Terminal streams).
    *   The `Runner` service listens here.

2.  **User Output (`*.cloudcodeterminal.work.gd`)**:
    *   **Port 3000**
    *   Used to serve the user's running web application (e.g., if they run `npm start`).
    *   This ensures cross-site scripting (XSS) in user code doesn't affect the main IDE.

**Ingress Routing Rule:**
*   Request to `<replId>.cloudcode.work.gd` -> Routes to Pod Service Port 3001.
*   Request to `<replId>.cloudcodeterminal.work.gd` -> Routes to Pod Service Port 3000.

---

## 🚀 Getting Started

### Prerequisites

*   **Node.js 18+** installed locally.
*   **Docker Desktop** (or Minikube) running with Kubernetes enabled.
*   **AWS Account** with an S3 Bucket created.
*   **Kubectl** configured to talk to your local cluster.

### Installation (Local Dev)

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/ShaikMohammad786/Cloud-Base-code-execution-platform-.git
    cd Cloud-Base-code-execution-platform-
    ```

2.  **Install Dependencies**:
    ```bash
    # Run this in all service directories
    npm install --prefix frontend
    npm install --prefix init-service
    npm install --prefix orchestrator-simple
    npm install --prefix runner
    ```

3.  **Start Services** (Separate Terminals):
    ```bash
    # Terminal 1: Frontend
    cd frontend && npm run dev
    
    # Terminal 2: Init Service
    cd init-service && npm run dev
    
    # Terminal 3: Orchestrator
    cd orchestrator-simple && npm run dev
    ```

### Configuration

Create a `.env` file in `init-service`, `orchestrator-simple`, and `runner`:

```env
PORT=3001  # Use 3002 for Orchestrator
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your-bucket-name
```

### DNS & Ingress Setup

**CRITICAL STEP**: You must configure DNS to route wildcard subdomains to your Ingress Controller (Nginx).

1.  **Install Nginx Ingress**:
    ```bash
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
    ```

2.  **Get Ingress IP**:
    ```bash
    kubectl get services -n ingress-nginx
    # Look for EXTERNAL-IP
    ```

3.  **Configure DNS** (e.g., in GoDaddy, Cloudflare, or `/etc/hosts`):
    *   Create an `A` record for `*.cloudcode.work.gd` pointing to your Ingress IP.
    *   Create an `A` record for `*.cloudcodeterminal.work.gd` pointing to your Ingress IP.

    *If running locally (Minikube), you must add these entries to your local `/etc/hosts` file for every new Repl ID you test, or use a tool like `dnsmasq`.*

---

## 📡 API Reference

### Init Service

**POST** `/project`
*   **Description**: Creates a new project id in S3.
*   **Body**:
    ```json
    {
      "replId": "my-project",
      "language": "python"
    }
    ```

### Orchestrator Service

**POST** `/start`
*   **Description**: Spins up the K8s pod for the project.
*   **Body**:
    ```json
    {
      "replId": "my-project"
    }
    ```

### Runner (WebSocket Events)

| Event | Payload | Description |
| :--- | :--- | :--- |
| `requestTerminal` | `{}` | Asks server to spawn a bash shell. |
| `terminalData` | `{ data: "ls\r" }` | Sends keystrokes to the server. |
| `fetchDir` | `"/src"` | Asks for file list in a folder. |
| `updateContent` | `{ path: "/index.js", content: "..." }` | Saves file to disk and S3. |

---

## 🚢 Deployment via Kubernetes

The `orchestrator-simple/service.yaml` file acts as a template. When you request a container, the orchestrator reads this file, replaces `service_name` with your `replId`, and applies it to the cluster.

**Core Components Deployed:**
1.  **Deployment**: 1 Replica of the Runner Image.
2.  **Service**: ClusterIP service exposing ports 3000 (App) and 3001 (Runner).
3.  **Ingress**: Routes traffic based on the Host header (`replId.domain.com`).

---


## 👥 Contributors

- **Frontend**: React, Monaco, Xterm
- **Backend Architecture**: Microservices
- **DevOps**: Kubernetes, Docker, AWS S3
