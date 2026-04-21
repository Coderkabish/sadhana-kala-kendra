  import mysql from "mysql2/promise";
  import dotenv from "dotenv";

  dotenv.config();

  const requiredDbVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missingDbVars = requiredDbVars.filter((name) => !process.env[name]);

  if (missingDbVars.length > 0) {
    throw new Error(`FATAL ERROR: Missing database environment variables: ${missingDbVars.join(", ")}`);
  }

  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
  });

  export default db;