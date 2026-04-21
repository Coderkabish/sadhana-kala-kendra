// Node.js script to create a test admin user
// Run with: node createAdmin.js

import db from "./config/db.js";
import bcrypt from "bcryptjs";

async function createAdmin() {
  try {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL must be configured in the environment");
    }

    const username = process.env.ADMIN_USERNAME;
    if (!username) {
      throw new Error("ADMIN_USERNAME must be configured in the environment");
    }

    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      throw new Error("ADMIN_PASSWORD must be configured in the environment");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`\n📝 Creating admin user with username: ${username}`);
    console.log(`🔒 Password: ${password}\n`);

    // Check if admin already exists
    const [existing] = await db.query(
      "SELECT admin_id FROM admin_user WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      console.log("⚠️  Admin user already exists!");
      console.log(`\nLogin with:\nUsername: ${username}\nPassword: ${password}`);
      process.exit(0);
    }

    // Create the admin user
    const [result] = await db.query(
      "INSERT INTO admin_user (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    console.log("✅ Admin user created successfully!");
    console.log(`Admin ID: ${result.insertId}`);
    console.log(`\nLogin Credentials:\nURL: ${frontendUrl}/admin/login`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
}

createAdmin();
