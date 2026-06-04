import { Router } from 'express';
import type { SQLInputValue } from 'node:sqlite';
import { z } from 'zod';
import { getDb } from '../db';
import { requireAuth } from '../auth/middleware';
import type { AttendanceRow } from '../types';

const router = Router();

const querySchema = z.object({
  employeeId: z.string().optional(),
  deviceId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
});

function serialize(row: AttendanceRow) {
  return {
    clientUuid: row.client_uuid,
    employeeId: row.employee_id,
    deviceId: row.device_id,
    capturedAt: row.captured_at,
    latitude: row.latitude,
    longitude: row.longitude,
    livenessPassed: row.liveness_passed === 1,
    livenessMethod: row.liveness_method,
    matchScore: row.match_score,
    receivedAt: row.received_at,
  };
}

/** Reporting: list attendance records with optional filters. */
router.get('/', requireAuth(['admin', 'operator']), (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'validation', details: parsed.error.flatten() });
    return;
  }
  const { employeeId, deviceId, from, to, limit } = parsed.data;

  const clauses: string[] = [];
  const params: SQLInputValue[] = [];
  if (employeeId) {
    clauses.push('employee_id = ?');
    params.push(employeeId);
  }
  if (deviceId) {
    clauses.push('device_id = ?');
    params.push(deviceId);
  }
  if (from) {
    clauses.push('captured_at >= ?');
    params.push(from);
  }
  if (to) {
    clauses.push('captured_at <= ?');
    params.push(to);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  params.push(limit ?? 100);

  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM attendance ${where} ORDER BY captured_at DESC LIMIT ?`)
    .all(...params) as unknown as AttendanceRow[];

  res.json({ count: rows.length, records: rows.map(serialize) });
});

/** Summary stats for a quick dashboard view. */
router.get('/stats', requireAuth(['admin', 'operator']), (_req, res) => {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) AS c FROM attendance').get() as { c: number }).c;
  const liveness = (
    db.prepare('SELECT COUNT(*) AS c FROM attendance WHERE liveness_passed = 1').get() as { c: number }
  ).c;
  const employees = (
    db.prepare('SELECT COUNT(DISTINCT employee_id) AS c FROM attendance').get() as { c: number }
  ).c;
  res.json({
    totalRecords: total,
    livenessPassed: liveness,
    distinctEmployees: employees,
  });
});

export default router;
