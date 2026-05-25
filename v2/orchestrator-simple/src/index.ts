import express from "express";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import yaml from "yaml";
import path from "path";
import cors from "cors";
import { KubeConfig, AppsV1Api, CoreV1Api, NetworkingV1Api } from "@kubernetes/client-node";
import { verifyJwt, AuthRequest } from "./middleware/verify-jwt";
import { startCleanupCron } from "./cleanup";
import { execSync } from "child_process";

// Auto-add hosts file entry for a replId (Windows)
function ensureHostsEntry(replId: string) {
    const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
    try {
        const content = fs.readFileSync(hostsPath, 'utf8');
        const entries = [
            `${replId}.cloudcode.local`,
            `${replId}.cloudcodeterminal.local`,
        ];
        const toAdd = entries.filter(e => !content.includes(e));
        if (toAdd.length > 0) {
            const lines = toAdd.map(e => `\n127.0.0.1 ${e}`).join('');
            // Use PowerShell to write as admin
            execSync(`powershell -Command "Add-Content -Path '${hostsPath}' -Value '${lines}'"`, { timeout: 5000 });
            console.log(`Added hosts entries for ${replId}`);
        }
    } catch (err: any) {
        console.warn(`Could not auto-add hosts entry (run as admin): ${err.message}`);
    }
}

const app = express();
app.use(express.json());
app.use(cors());

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3003';

// Updated utility function to handle multi-document YAML files
const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
        let docString = doc.toString();
        const regex = new RegExp(`service_name`, 'g');
        docString = docString.replace(regex, replId);
        docString = docString.replace(/process\.env\.AWS_ACCESS_KEY_ID/g, process.env.AWS_ACCESS_KEY_ID || '');
        docString = docString.replace(/process\.env\.AWS_SECRET_ACCESS_KEY/g, process.env.AWS_SECRET_ACCESS_KEY || '');
        docString = docString.replace(/process\.env\.AWS_DEFAULT_REGION/g, process.env.AWS_DEFAULT_REGION || 'eu-north-1');
        console.log(docString);
        return yaml.parse(docString);
    });
    return docs;
};

app.post("/start", verifyJwt, async (req: AuthRequest, res) => {
    const { userId, replId } = req.body;
    const namespace = "default";

    // Auto-add hosts entries for this project
    ensureHostsEntry(replId);

    try {
        // Check if deployment already exists
        try {
            const existingDeployment = await appsV1Api.readNamespacedDeployment(replId, namespace);
            if (existingDeployment) {
                console.log(`Deployment ${replId} already exists`);
                // Activate in auth-service
                await fetch(`${AUTH_SERVICE_URL}/api/projects/${replId}/activate`, { method: 'PATCH' }).catch(() => {});
                return res.status(200).send({ message: "Resources already exist" });
            }
        } catch (error: any) {
            if (error.statusCode !== 404) {
                throw error;
            }
        }

        const kubeManifests = readAndParseKubeYaml(path.join(__dirname, "../service.yaml"), replId);
        for (const manifest of kubeManifests) {
            switch (manifest.kind) {
                case "Deployment":
                    await appsV1Api.createNamespacedDeployment(namespace, manifest);
                    break;
                case "Service":
                    await coreV1Api.createNamespacedService(namespace, manifest);
                    break;
                case "Ingress":
                    await networkingV1Api.createNamespacedIngress(namespace, manifest);
                    break;
                default:
                    console.log(`Unsupported kind: ${manifest.kind}`);
            }
        }

        // Activate project in auth-service
        await fetch(`${AUTH_SERVICE_URL}/api/projects/${replId}/activate`, { method: 'PATCH' }).catch(() => {});

        res.status(200).send({ message: "Resources created successfully" });
    } catch (error) {
        console.error("Failed to create resources", error);
        res.status(500).send({ message: "Failed to create resources" });
    }
});

// Stop a project (delete K8s resources)
app.post("/stop", verifyJwt, async (req: AuthRequest, res) => {
    const { replId } = req.body;
    const namespace = "default";

    if (!replId) {
        return res.status(400).json({ error: 'replId is required' });
    }

    try {
        try { await appsV1Api.deleteNamespacedDeployment(replId, namespace); } catch (e) {}
        try { await coreV1Api.deleteNamespacedService(replId, namespace); } catch (e) {}
        try { await networkingV1Api.deleteNamespacedIngress(replId, namespace); } catch (e) {}

        // Deactivate in auth-service
        await fetch(`${AUTH_SERVICE_URL}/api/projects/${replId}/deactivate`, { method: 'PATCH' }).catch(() => {});

        res.json({ message: "Resources deleted successfully" });
    } catch (error) {
        console.error("Failed to delete resources", error);
        res.status(500).json({ message: "Failed to delete resources" });
    }
});

// Check pod status
app.get("/status/:replId", async (req, res) => {
    const { replId } = req.params;
    try {
        await appsV1Api.readNamespacedDeployment(replId, "default");
        res.json({ running: true });
    } catch (error: any) {
        if (error.statusCode === 404) {
            res.json({ running: false });
        } else {
            res.status(500).json({ error: "Failed to check status" });
        }
    }
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
    startCleanupCron();
});
