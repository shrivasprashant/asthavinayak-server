import jwt from 'jsonwebtoken';

const isLoggedIn = (req, res, next) => {
    console.log("Cookies:", req.cookies);

    const token = req.cookies.token;
    console.log('Token found:', token ? "yes" : "no");

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized: No token provided',
            success: false,
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized: Invalid or expired token',
            success: false,
        });
    }
};

export { isLoggedIn };
