const router = require("express").Router()
const User = require("../models/User")
const bcrypt = require("bcrypt")
const generateToken = require("../utils/generateToken")
const createError = require('http-errors')

router.route("/register").post( async (req, res, next) => {
    const existingUser = await User.findOne({
        where: {
            email: req.body.email
        }
    })
    if (existingUser) return next(createError(409, "User with this email already exists"))
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const newUser = await User.create({
        email: req.body.email,
        password: hashedPassword,
    }).catch((err) => res.send(err))
    const token = generateToken(newUser.dataValues)
    res.send({
        token,
        email: newUser.dataValues.email,
        uuid: newUser.dataValues.uuid
    })
})


router.route("/login").post( async (req, res, next) => {
    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    })
    if (!user) return next(createError(401, "Not existing user"))
    if (await bcrypt.compare(req.body.password, user.dataValues.password)) {
        const token = generateToken(user.dataValues)
        res.send({
            email: user.dataValues.email,
            uuid: user.dataValues.uuid,
            token
        })
    } else {
        next(createError(401, "Wrong password"))
    }
})

module.exports = router