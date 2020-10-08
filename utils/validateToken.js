const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken")
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return next(createHttpError(403, "Not valid token"))
        req.user = user
        next()
    })
}