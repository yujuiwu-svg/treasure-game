import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';

const router = Router();

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const session_token = uuidv4();

  const result = db
    .prepare('INSERT INTO users (username, password_hash, session_token) VALUES (?, ?, ?)')
    .run(username, password_hash, session_token);

  res.json({ user: { id: result.lastInsertRowid, username }, token: session_token });
});

router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const session_token = uuidv4();
  db.prepare('UPDATE users SET session_token = ? WHERE id = ?').run(session_token, user.id);

  res.json({ user: { id: user.id, username: user.username }, token: session_token });
});

router.post('/signout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    db.prepare('UPDATE users SET session_token = NULL WHERE session_token = ?').run(token);
  }
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  const user = db
    .prepare('SELECT id, username FROM users WHERE session_token = ?')
    .get(token) as any;
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({ user });
});

export default router;
