import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoute.js';
import courseRouter from "./routes/courseRoute.js";
import cookieParser from "cookie-parser";
import homeRouter from "./routes/homeRoute.js";
//import getUserData from "./utils/getUserData.js"
import dotenv from 'dotenv';
dotenv.config({ path: "./server/.env" });

const app = express();

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
// app.use("/user", getUserData);


const PORT = process.env.PORT || 8000;
app.listen(process.env.PORT, () => {
    console.log(`Server Started on Port ${process.env.PORT}`);
  });
  
