const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token;

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