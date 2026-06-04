import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDb } from '../db';
import { config } from '../config';
import { signToken, verifyToken } from '../auth/jwt';
import { requireAuth } from '../auth/middleware';
import type { UserRow } from '../types';

const router = Router();

const registerSchema = z.object({
  employeeId: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(['admin', 'operator', 'field']).optional(),
});

const loginSchema = z.object({
  employeeId: z.string().min(1),
  password: z.string().min(1),
});

/**
 * Register a user. Bootstrap rule: if the users table is empty, the first
 * registration is allowed without a token and is forced to 'admin'. After
 * that, only an admin JWT may create users.
 */
router.post('/register', (req, res) => {
  const db = getDb();
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'validation', details: parsed.error.flatten() });
    return;
  }

  const userCount = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c;
  let role = parsed.data.role ?? 'field';

  if (userCount === 0) {
    role = 'admin'; // bootstrap the very first account as admin
  } else {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: 'missing_token' });
      return;
    }
    try {
      const payload = verifyToken(header.slice(7));
      if (payload.role !== 'admin') {
        res.status(403).json({ error: 'forbidden' });
        return;
      }
    } catch {
      res.status(401).json({ error: 'invalid_token' });
      return;
    }
  }

  const passwordHash = parsed.data.password
    ? bcrypt.hashSync(parsed.data.password, config.bcryptRounds)
    : null;

  try {
    const info = db
      .prepare('INSERT INTO users (employee_id, name, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(parsed.data.employeeId, parsed.data.name, passwordHash, role);
    res.status(201).json({
      id: info.lastInsertRowid,
      employeeId: parsed.data.employeeId,
      name: parsed.data.name,
      role,
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'employee_exists' });
      return;
    }
    throw e;
  }
});

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'validation', details: parsed.error.flatten() });
    return;
  }
  const db = getDb();
  const user = db
    .prepare('SELECT * FROM users WHERE employee_id = ? AND active = 1')
    .get(parsed.data.employeeId) as UserRow | undefined;

  if (!user || !user.password_hash || !bcrypt.compareSync(parsed.data.password, user.password_hash)) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }

  const token = signToken({ sub: user.employee_id, role: user.role, name: user.name });
  res.json({
    token,
    user: { employeeId: user.employee_id, name: user.name, role: user.role },
  });
});

router.get('/me', requireAuth(), (req, res) => {
  res.json({ user: req.user });
});

export default router;
