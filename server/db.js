import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

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

      if (process.env.NODE_ENV !== 'production') {
        console.log("Database Connected Successfully");
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Database Connection Failed:", error);
      }
      throw error;
    }
  }

  return pool;
};
