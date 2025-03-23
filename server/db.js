import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

let connection;

export const connectToDatabase = async () => {
  if (!connection) {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      console.log(" Database Connected Successfully");
      // Handle connection errors
      connection.on("error", (err) => {
        console.error(" Database Error:", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          console.log(" Reconnecting to database...");
          connection = null; // Reset connection and attempt reconnect
          connectToDatabase();
        }
      });

    } catch (error) {
      console.error(" Database Connection Failed:", error);
      connection = null; // Ensure no faulty connection persists
    }
  }

  return connection;
};
