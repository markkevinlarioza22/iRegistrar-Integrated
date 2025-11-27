require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const mongoURI = process.env.MONGO_URI;

async function migrate() {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB for migration');

    const db = mongoose.connection.db;

    // Ensure collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('✅ Users collection created with unique email index');
    }

    if (!collectionNames.includes('student_profiles')) {
      await db.createCollection('student_profiles');
      await db.collection('student_profiles').createIndex({ student_id: 1 }, { unique: true });
      console.log('✅ Student_profiles collection created with unique student_id index');
    }

    if (!collectionNames.includes('document_requests')) {
      await db.createCollection('document_requests');
      await db.collection('document_requests').createIndex({ id: 1 }, { unique: true });
      console.log('✅ Document_requests collection created with unique id index');
    }

    if (!collectionNames.includes('clearance_statuses')) {
      await db.createCollection('clearance_statuses');
      await db.collection('clearance_statuses').createIndex({ student_user_id: 1, instructor_id: 1 }, { unique: true });
      console.log('✅ Clearance_statuses collection created with compound unique index');
    }

    if (!collectionNames.includes('notifications')) {
      await db.createCollection('notifications');
      await db.collection('notifications').createIndex({ id: 1 }, { unique: true });
      console.log('✅ Notifications collection created with unique id index');
    }

    console.log('🎉 MongoDB migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔒 MongoDB connection closed after migration');
  }
}

migrate();
