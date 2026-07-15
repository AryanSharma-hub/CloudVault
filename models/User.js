/**
 * models/User.js
 * Plain data model representing a User. Provides a safe, serializable
 * shape (never exposes the password hash to views/JSON responses).
 */
class User {
  constructor(row) {
    this.id = row.id;
    this.firstName = row.first_name;
    this.lastName = row.last_name;
    this.email = row.email;
    this.passwordHash = row.password_hash;
    this.createdAt = row.created_at;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toSafeObject() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      fullName: this.fullName,
      createdAt: this.createdAt,
    };
  }
}

module.exports = User;
