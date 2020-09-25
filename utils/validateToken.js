const jwt = require("jsonwebtoken")
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = (token) => {
    return jwt.verify(token, process.env.TOKEN_SECRET)
}