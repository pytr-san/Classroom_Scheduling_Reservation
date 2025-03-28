
import dotenv from "dotenv";

dotenv.config({path: "./server/.env" }); // Load environment variables

export const verifyAdminPin = (req, res) => {
    const { pin } = req.body;

    if (!pin) {
        return res.status(400).json({ success: false, message: "PIN is required" });
    }

    if (pin === process.env.ADMIN_ACCESS_PIN) {
       
        return res.status(200).json({ success: true, message: "Access granted" });
    } else {
        
        return res.status(401).json({ success: false, message: "Incorrect PIN" });
    }
};
