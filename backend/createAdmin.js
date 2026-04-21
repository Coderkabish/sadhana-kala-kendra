import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Ensure DB_PORT comes from the environment
const dbPort = Number(process.env.DB_PORT);

if (!dbPort) {
  console.error("Error: DB_PORT must be set in the environment.");
  process.exit(1);
}

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: dbPort,
});

const args = process.argv.slice(2);
const username = args[0];
const password = args[1];

if (!username || !password) {
  console.error("Usage: node createAdmin.js <username> <password>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Error: Password must be at least 8 characters long.");
  process.exit(1);
}

async function createAdmin() {
  try {
    console.log("Connected to MySQL database successfully");
    const hashedPassword = await bcrypt.hash(password, 10); 

    const [result] = await db.execute(
      "INSERT INTO admin_user (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    console.log(`Admin user '${username}' created successfully with ID ${result.insertId}`);
    process.exit(0);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.error(`Error: Username '${username}' already exists.`);
    } else {
      console.error("Error creating admin user:", err.message);
    }
    process.exit(1);
  } finally {
    await db.end();
  }
}

createAdmin();