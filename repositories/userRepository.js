/**
 * repositories/userRepository.js
 *
 * Direct SQLite access for the `users` table. This is the ONLY file in the
 * layers above (services) that is allowed to run SQL for users.
 * SQLiteMetadataService is the only consumer of this repository.
 */

const { db } = require('../config/database');

const userRepository = {
  create({ firstName, lastName, email, passwordHash }) {
    const stmt = db.prepare(`
      INSERT INTO users (first_name, last_name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(firstName, lastName, email.toLowerCase(), passwordHash);
    return this.findById(info.lastInsertRowid);
  },

  findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email.toLowerCase());
  },

  findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },
};

module.exports = userRepository;
