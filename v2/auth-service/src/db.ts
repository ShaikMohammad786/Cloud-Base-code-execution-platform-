import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'auth.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    avatar TEXT,
    provider TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    github_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repl_id TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    language TEXT NOT NULL,
    is_active INTEGER DEFAULT 0,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// User operations
export function findOrCreateUser(profile: {
  email: string;
  name: string;
  avatar: string;
  provider: string;
  providerId: string;
  githubToken?: string;
}) {
  const existing = db.prepare(
    'SELECT * FROM users WHERE provider = ? AND provider_id = ?'
  ).get(profile.provider, profile.providerId) as any;

  if (existing) {
    // Update github token if provided
    if (profile.githubToken) {
      db.prepare('UPDATE users SET github_token = ? WHERE id = ?')
        .run(profile.githubToken, existing.id);
    }
    return existing;
  }

  const result = db.prepare(
    'INSERT INTO users (email, name, avatar, provider, provider_id, github_token) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    profile.email,
    profile.name,
    profile.avatar,
    profile.provider,
    profile.providerId,
    profile.githubToken || null
  );

  return { id: result.lastInsertRowid, ...profile };
}

export function getUserById(id: number) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

// Project operations
export function createProject(data: {
  replId: string;
  userId: number;
  name: string;
  language: string;
}) {
  const result = db.prepare(
    'INSERT INTO projects (repl_id, user_id, name, language) VALUES (?, ?, ?, ?)'
  ).run(data.replId, data.userId, data.name, data.language);
  return { id: result.lastInsertRowid, ...data };
}

export function getUserProjects(userId: number) {
  return db.prepare(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY last_accessed DESC'
  ).all(userId);
}

export function deleteProject(replId: string, userId: number) {
  return db.prepare(
    'DELETE FROM projects WHERE repl_id = ? AND user_id = ?'
  ).run(replId, userId);
}

export function updateHeartbeat(replId: string) {
  return db.prepare(
    'UPDATE projects SET last_accessed = CURRENT_TIMESTAMP WHERE repl_id = ?'
  ).run(replId);
}

export function setProjectActive(replId: string, active: boolean) {
  return db.prepare(
    'UPDATE projects SET is_active = ? WHERE repl_id = ?'
  ).run(active ? 1 : 0, replId);
}

export function getActiveProjects() {
  return db.prepare(
    'SELECT * FROM projects WHERE is_active = 1'
  ).all();
}

export function getProjectByReplId(replId: string) {
  return db.prepare(
    'SELECT * FROM projects WHERE repl_id = ?'
  ).get(replId);
}

export default db;
