const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "CourseBookingAPI";
require('dotenv').config();

module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    };

    return jwt.sign(data, JWT_SECRET_KEY, {});
}

module.exports.verify = (req, res, next) => {
    console.log("HEADERS:", req.headers);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log("NO AUTH HEADER");
        return res.status(401).send({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("TOKEN RECEIVED:", token);

    jwt.verify(token, process.env.JWT_SECRET_KEY || "CourseBookingAPI", (err, decoded) => {
        if (err) {
            console.log("JWT ERROR:", err.message);
            return res.status(403).send({ message: err.message });
        }

        console.log("DECODED:", decoded);
        req.user = decoded;
        next();
    });
};

module.exports.verifyAdmin = (req, res, next) => {
    if(req.user.isAdmin) {
        next();
    } else {
        return res.status(403).send({
            auth: "Failed",
            message: "Action Forbidden"
        })
    }
}


module.exports.errorHandler = (err, req, res, next) => {
    
    console.error(err);

   
    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || 'SERVER_ERROR',
            details: err.details
        }
    });
};

module.exports.isLoggedIn = (req, res, next) => {
    if (req.user) {

        next()

    } else {
        
        res.sendStatus(401)
    }
}