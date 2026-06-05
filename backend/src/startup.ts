/**
 * startup.ts — Auto-seeds admin user and device on first run.
 * Safe to run on every start (idempotent).
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from './db';

export function seedIfEmpty() {
  const db = getDb();

  // Create admin user if none exists
  const userCount = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c;
  if (userCount === 0) {
    const hash = bcrypt.hashSync('Admin@1234', 10);
    db.prepare('INSERT INTO users (employee_id, name, password_hash, role) VALUES (?, ?, ?, ?)').run(
      'admin', 'NHAI Admin', hash, 'admin'
    );
    console.log('[Startup] Created admin user (employeeId: admin, password: Admin@1234)');
  }

  // Create device if none exists
  const deviceCount = (db.prepare('SELECT COUNT(*) AS c FROM devices').get() as { c: number }).c;
  if (deviceCount === 0) {
    const apiKey = 'aegis-hackathon-key-nhai2025';
    const hash = bcrypt.hashSync(apiKey, 10);
    db.prepare('INSERT INTO devices (device_id, name, api_key_hash) VALUES (?, ?, ?)').run(
      'aegis-nhai-001', 'NHAI Aegis Mobile', hash
    );
    console.log('[Startup] Created device: aegis-nhai-001, API key: aegis-hackathon-key-nhai2025');
  }
}
