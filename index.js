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
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.use(cors())
app.use(bodyParser.json())

db.authenticate().then(() => {
    /* db.sync({ force: true }) */
    console.log("db connected")

}).catch((err) => {
    console.log("database error", err)
})

app.post("/addExercise", (req, res) => {
    /* const user = validateToken(req.body.token).then(user => console.log(user, "hej")).catch((err) => console.log(err), "err") */
    try {
        const user = validateToken(req.body.token)
        console.log(user)
    } catch (err) {
        console.log(err)
    }

    /*     jwt.verify(req.body.token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            console.log(user)
            Exercise.create({
                name: req.body.name,
                isDeleted: false
            })
                .then(result => res.send(result))
                .catch((err) => res.send(err))
        }) */
})

app.get("/getExercises", (req, res) => {
    Exercise.findAll({
        where: {
            isDeleted: false
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

app.post("/deleteExercise", (req, res) => {
    Exercise.update({
        isDeleted: true
    }, {
        where: {
            id: req.body.id
        }
    })
        .then(result => res.send(result))
        .catch(err => res.send(err))
})

app.post("/addRecord", (req, res) => {
    Record.create({
        date: new Date(),
        exerciseId: req.body.exerciseId,
        reps: req.body.reps,
        series: req.body.series,
        weight: req.body.weight
    }).then(result => res.send(result))
        .catch(err => res.send(err))
})

app.get("/getRecords", (req, res) => {
    Record.findAll({
        where: {
            exerciseId: req.query.exerciseId
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
    res.send(token)
})

app.post("/users/login", async (req, res) => {
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
        res.send("wrong password")
    }

})

app.listen(3000, () => console.log("Server up"))