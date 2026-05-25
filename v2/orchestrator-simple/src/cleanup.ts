import { KubeConfig, AppsV1Api, CoreV1Api, NetworkingV1Api } from "@kubernetes/client-node";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3003';
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const kc = new KubeConfig();
kc.loadFromDefault();
const k8sAppsApi = kc.makeApiClient(AppsV1Api);
const k8sCoreApi = kc.makeApiClient(CoreV1Api);
const k8sNetApi = kc.makeApiClient(NetworkingV1Api);

async function cleanupIdlePods() {
    try {
        const res = await fetch(`${AUTH_SERVICE_URL}/api/projects/active`);
        if (!res.ok) return;
        const projects = await res.json() as any[];
        const now = Date.now();

        for (const project of projects) {
            const lastAccessed = new Date(project.last_accessed).getTime();
            if (now - lastAccessed > IDLE_TIMEOUT_MS) {
                console.log(`Cleaning up idle project: ${project.repl_id}`);
                try {
                    await k8sAppsApi.deleteNamespacedDeployment(project.repl_id, 'default');
                    await k8sCoreApi.deleteNamespacedService(project.repl_id, 'default');
                    await k8sNetApi.deleteNamespacedIngress(project.repl_id, 'default');
                    await fetch(`${AUTH_SERVICE_URL}/api/projects/${project.repl_id}/deactivate`, { method: 'PATCH' });
                    console.log(`Cleaned up: ${project.repl_id}`);
                } catch (e: any) {
                    console.error(`Cleanup failed for ${project.repl_id}:`, e.message);
                }
            }
        }
    } catch (e: any) {
        console.error('Cleanup cycle error:', e.message);
    }
}

export function startCleanupCron() {
    console.log('Auto-cleanup started (every 5 minutes)');
    setInterval(cleanupIdlePods, 5 * 60 * 1000);
    // Run once after 1 minute
    setTimeout(cleanupIdlePods, 60 * 1000);
}
