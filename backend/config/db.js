  import mysql from "mysql2/promise";
  import dotenv from "dotenv";

  dotenv.config();

  const requiredDbVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missingDbVars = requiredDbVars.filter((name) => process.env[name] === undefined);

  if (missingDbVars.length > 0) {
    throw new Error(`FATAL ERROR: Missing database environment variables: ${missingDbVars.join(", ")}`);
  }

  // Validate and default DB_PORT
  const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  if (!Number.isFinite(dbPort) || dbPort <= 0 || dbPort > 65535) {
    throw new Error(`FATAL ERROR: DB_PORT must be a valid port number (1-65535), got: ${process.env.DB_PORT}`);
  }

  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: dbPort,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
  });

  export default db;