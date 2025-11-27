const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const email = "theadmin@gmail.com";
    const password = "admin123";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists:");
      console.log(existing);
      process.exit();
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: "Administrator",
      email,
      password: hashed,
      role: "admin"
    });

    console.log("Admin created successfully:");
    console.log(admin);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
}

createAdmin();
