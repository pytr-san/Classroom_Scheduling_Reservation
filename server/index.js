import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoute.js';
import courseRouter from "./routes/courseRoute.js";
import classRoute from "./routes/classroomRoute.js";
import cookieParser from "cookie-parser";
import homeRouter from "./routes/homeRoute.js";
import adminRouter from "./routes/adminRoute.js";
import uploadRoute from './routes/uploadRoute.js';
import reservationRoute from "./routes/reservationRoutes.js"
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: "./server/.env" });

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true,  // Allow cookies, authentication headers, etc.
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"] // Allowed headers
}
));

app.use(express.json())
app.use(cookieParser());
app.use('/auth', authRouter) 
app.use('/api', courseRouter);
app.use("/", homeRouter);
app.use("/api/admin", adminRouter);
app.use("/classrooms", classRoute);  
app.use("/api",reservationRoute);
// Serve static files for viewing (uploads)
app.use('/uploads/pdfs', express.static(path.join(__dirname, '../uploads/pdfs')));

// Routes
app.use('/api', uploadRoute);

const PORT = process.env.PORT || 8000;
app.listen(process.env.PORT, () => {
    console.log(`Server Started on Port ${process.env.PORT}`);
  });
  
