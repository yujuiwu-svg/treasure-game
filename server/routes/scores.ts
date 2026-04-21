import { Router, Request, Response, NextFunction } from 'express';
import db from '../db';

const router = Router();

interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = db
    .prepare('SELECT id, username FROM users WHERE session_token = ?')
    .get(token) as any;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  req.user = user;
  next();
}

router.post('/', requireAuth, (req: AuthRequest, res) => {
  const { score } = req.body;
  if (score === undefined) return res.status(400).json({ error: 'Score required' });

  db.prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)').run(req.user!.id, score);
  res.json({ ok: true });
});

router.get('/', requireAuth, (req: AuthRequest, res) => {
  const scores = db
    .prepare(
      'SELECT score, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC LIMIT 20'
    )
    .all(req.user!.id);

  res.json({ scores });
});

export default router;
