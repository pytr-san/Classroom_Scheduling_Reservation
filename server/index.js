import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoute.js';
import courseRouter from "./routes/courseRoute.js";
import classRoute from "./routes/classroomRoute.js";
import cookieParser from "cookie-parser";
import homeRouter from "./routes/homeRoute.js";
import adminRouter from "./routes/adminRoute.js";
import uploadRoute from './routes/uploadRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// app.use(cors({
//     origin: "http://localhost:5173", // Allow requests from your frontend
//     credentials: true,  // Allow cookies, authentication headers, etc.
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
//     allowedHeaders: ["Content-Type", "Authorization"] // Allowed headers
// }
// ));
const isProduction = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: isProduction ? "https://your-frontend-domain.com" : "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", 'PATCH', "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization",'no-refresh']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use('/auth', authRouter) 
app.use('/api', courseRouter);
app.use("/", homeRouter);
app.use("/api", adminRouter);
app.use("/classrooms", classRoute);  

app.use('/uploads/pdfs', express.static(path.join(__dirname, '/uploads/pdfs')));

app.use('/api', uploadRoute);

if (isProduction) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  // Fallback to index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 8000;
app.listen(process.env.PORT, () => {
    console.log(`Server Started on Port ${process.env.PORT}`);
  });
  
