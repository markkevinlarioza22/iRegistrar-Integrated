require('dotenv').config();
const db = require('./index');

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'admin'))
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    course TEXT,
    contact_number TEXT,
    school_year TEXT,
    specialization TEXT,
    section TEXT,
    is_profile_complete BOOLEAN NOT NULL DEFAULT 0,
    profile_image_url TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_requests (
    id TEXT PRIMARY KEY,
    student_user_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Pending', 'Processing', 'Ready for Pickup', 'Completed')),
    request_date TEXT NOT NULL,
    release_date TEXT,
    FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clearance_statuses (
    student_user_id TEXT NOT NULL,
    instructor_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Pending', 'Cleared')),
    PRIMARY KEY (student_user_id, instructor_id),
    FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN NOT NULL DEFAULT 0,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

function migrate() {
  try {
    db.exec(createTablesSQL);
    console.log('✅ Database migration complete: Tables created or already exist.');
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    process.exit(1);
  } finally {
    db.close();
    console.log('🔒 Database connection closed after migration.');
  }
}

migrate();
