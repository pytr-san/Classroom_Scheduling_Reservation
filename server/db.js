import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

let pool;

export const connectToDatabase = async () => {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log("✅ Database Connected Successfully");
    } catch (error) {
      console.error("❌ Database Connection Failed:", error);
      throw error;
    }
  }

  return pool;
};
