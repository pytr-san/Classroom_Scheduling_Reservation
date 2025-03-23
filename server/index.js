import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoute.js'
import courseRouter from "./routes/courseRoute.js";
import dotenv from 'dotenv';
dotenv.config({ path: "./server/.env" });

const app = express();
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true,  // Allow cookies, authentication headers, etc.
}
));

app.use(express.json())
app.use('/auth', authRouter)
app.use('/api', courseRouter);
app.get("/", (req, res) =>{
    res.send("<h1>I was Here</h1>")
})


app.listen(process.env.PORT || 8000, () => {
    console.log(`Server Started on Port ${process.env.PORT || 8000}`);
  });
  
