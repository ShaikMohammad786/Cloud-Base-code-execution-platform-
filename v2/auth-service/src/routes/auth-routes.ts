import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../middleware/verify-jwt';

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Google OAuth
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// GitHub OAuth
router.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email', 'repo'] })
);

router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/login?error=github_failed` }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Get current user from JWT
router.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'cloudcode_jwt_secret_2024';
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

export default router;
