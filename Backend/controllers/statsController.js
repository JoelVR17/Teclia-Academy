import { getDb, saveDatabase } from '../db/init.js';

const VISIT_KEY = 'page_visits';

export const recordVisit = (req, res) => {
  try {
    const db = getDb();
    const existing = db.exec('SELECT value FROM site_stats WHERE key = ?', [VISIT_KEY]);

    if (existing.length > 0 && existing[0].values.length > 0) {
      db.run('UPDATE site_stats SET value = value + 1 WHERE key = ?', [VISIT_KEY]);
    } else {
      db.run('INSERT INTO site_stats (key, value) VALUES (?, 1)', [VISIT_KEY]);
    }

    saveDatabase();

    const result = db.exec('SELECT value FROM site_stats WHERE key = ?', [VISIT_KEY]);
    const total = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : 1;

    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVisitStats = (req, res) => {
  try {
    const db = getDb();
    const visits = db.exec('SELECT value FROM site_stats WHERE key = ?', [VISIT_KEY]);
    const total = visits.length > 0 && visits[0].values.length > 0 ? visits[0].values[0][0] : 0;

    const students = db.exec("SELECT COUNT(*) FROM users WHERE LOWER(COALESCE(role, 'student')) != 'admin'");
    const studentCount = students.length > 0 && students[0].values.length > 0 ? students[0].values[0][0] : 0;

    res.json({ pageVisits: total, studentCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
