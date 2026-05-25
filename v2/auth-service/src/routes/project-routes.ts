import { Router, Request, Response } from 'express';
import { verifyJwt } from '../middleware/verify-jwt';
import {
  createProject,
  getUserProjects,
  deleteProject,
  updateHeartbeat,
  setProjectActive,
  getActiveProjects,
  getProjectByReplId,
} from '../db';

const router = Router();

// List user's projects
router.get('/api/projects', verifyJwt as any, (req: any, res: Response) => {
  try {
    const projects = getUserProjects(req.user!.userId);
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create project
router.post('/api/projects', verifyJwt as any, (req: any, res: Response) => {
  try {
    const { replId, name, language } = req.body;
    if (!replId || !language) {
      return res.status(400).json({ error: 'replId and language are required' });
    }
    const project = createProject({
      replId,
      userId: req.user!.userId,
      name: name || replId,
      language,
    });
    res.json(project);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Project already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete project
router.delete('/api/projects/:replId', verifyJwt as any, (req: any, res: Response) => {
  try {
    const { replId } = req.params;
    deleteProject(replId, req.user!.userId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Heartbeat
router.post('/api/projects/:replId/heartbeat', verifyJwt as any, (req: any, res: Response) => {
  try {
    updateHeartbeat(req.params.replId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Activate project
router.patch('/api/projects/:replId/activate', (req, res) => {
  try {
    setProjectActive(req.params.replId, true);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate project
router.patch('/api/projects/:replId/deactivate', (req, res) => {
  try {
    setProjectActive(req.params.replId, false);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get active projects (for cleanup service)
router.get('/api/projects/active', (req, res) => {
  try {
    const projects = getActiveProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
