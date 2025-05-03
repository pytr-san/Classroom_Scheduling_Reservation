import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // Get the token from the cookies
    const token = req.cookies.token;
    //console.log("Cookies token",token);
    // const authHeader = req.headers.authorization;
    // const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ valid: false, message: "Unauthorized: No token provided" });
    }

    try {
       
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  

        next();  
    } catch (error) {

        res.clearCookie("token");
        return res.status(403).json({ valid: false, message: "Invalid token" });
    }
};

export default authMiddleware;
