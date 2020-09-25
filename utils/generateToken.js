const jwt = require("jsonwebtoken")
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = (user) => {
    return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "60m" })
}