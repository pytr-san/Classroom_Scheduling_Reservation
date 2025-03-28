import express from "express";
import { verifyAdminPin } from "../controllers/adminControllers.js";

const router = express.Router();

router.post("/verify-pin", verifyAdminPin);

export default router;
