import jwt from 'jsonwebtoken';

const refreshTokenMiddleware = (req, res, next) => {
  const token = req.cookies.token; // HTTP-only cookie

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH);
    req.user = decoded;
    console.log("Decoded refresh token:", decoded); 
    next();
  } catch (err) { 
    res.clearCookie("token");
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export default refreshTokenMiddleware;
