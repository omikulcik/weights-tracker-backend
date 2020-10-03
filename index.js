const db = require("./config/database")
const express = require("express")
const Exercise = require("./models/Exercise")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const Record = require("./models/Record")
const User = require("./models/User")
const bcrypt = require("bcrypt")
const validateToken = require("./utils/validateToken")
const generateToken = require("./utils/generateToken")
const createError = require('http-errors')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.use(cors())
app.use(bodyParser.json())


db.authenticate().then(() => {
    /*  db.sync({ force: true }) */
    console.log("db connected")

}).catch((err) => {
    console.log("database error", err)
})

app.post("/addExercise", validateToken, (req, res) => {
    Exercise.create({
        name: req.body.name,
        isDeleted: false,
        uuid: req.user.uuid
    })
        .then(result => res.send(result))
        .catch((err) => res.send(err))
})

app.get("/getExercises", validateToken, (req, res) => {
    Exercise.findAll({
        where: {
            isDeleted: false,
            uuid: req.user.uuid
        },
        attributes: {
            include: [[db.fn("COUNT", db.col("Records.id")), "recordsCount"], [db.fn("MAX", db.col("Records.weight")), "maxWeight"]]
        },
        include: [{ model: Record, attributes: [] }],
        group: ["Exercise.id"]
    })
        .then(result => res.send(result))
        .catch(err => res.send(err))
})

app.post("/deleteExercise", validateToken, (req, res) => {
    Exercise.update({
        isDeleted: true
    }, {
        where: {
            id: req.body.id,
            uuid: req.user.uuid
        }
    })
        .then(result => res.send(result))
        .catch(err => res.send(err))
})

app.post("/addRecord", validateToken, (req, res) => {
    Record.create({
        date: new Date(),
        exerciseId: req.body.exerciseId,
        reps: req.body.reps,
        series: req.body.series,
        weight: req.body.weight
    }).then(result => res.send(result))
        .catch(err => res.send(err))
})

app.get("/getRecords", validateToken, (req, res) => {
    Record.findAll({
        where: {
            exerciseId: req.query.exerciseId,
            isDeleted: false
        }
    }).then(result => res.send(result))
        .catch(err => res.send(err))
})

app.post("/deleteRecord", validateToken, (req, res) => {
    Record.update({
        isDeleted: true
    }, {
        where: {
            id: req.body.recordId
        }
    }).then(result => res.send(result))
        .catch(err => res.send(err))
})

app.post("/users/register", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const newUser = await User.create({
        email: req.body.email,
        password: hashedPassword,
    }).catch((err) => res.send(err))
    console.log(newUser.dataValues)
    const token = generateToken(newUser.dataValues)
    res.send({
        token,
        email: newUser.dataValues.email,
        uuid: newUser.dataValues.uuid
    })
})

app.post("/users/login", async (req, res, next) => {
    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    })
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

app.post("/users/authStatus", validateToken, (req, res) => {
    res.send({
        uuid: req.user.uuid,
        email: req.user.email
    })
})

app.use((error, req, res, next) => {

    res.status(error.status || 500)
    res.json({
        message: error.message,
        status: error.status
    })
})

app.listen(3000, () => console.log("Server up"))

