const db = require("./config/database")
const express = require("express")
const Exercise = require("./models/Exercise")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const Record = require("./models/Record")
const validateToken = require("./utils/validateToken")
const usersRouter = require("./routers/usersRouter")
const port = process.env.PORT || 3000
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.use(cors())
app.use(bodyParser.json())
app.use("/users", usersRouter)

db.authenticate().then(() => {
    /* db.sync({ force: true }) */
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
            include: [
                [db.fn("COUNT", db.col("Records.id")), "recordsCount"],
                [db.fn("MAX", db.col("Records.weight")), "maxWeight"]]
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
        date: req.body.date,
        exerciseId: req.body.exerciseId,
        reps: req.body.reps,
        series: req.body.series,
        weight: req.body.weight,
        uuid: req.user.uuid
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



app.post("/users/authStatus", validateToken, (req, res) => {
    res.send({
        uuid: req.user.uuid,
        email: req.user.email
    })
})

app.get("/getDashboardData", validateToken, (req, res) => {
    console.log("called")
    Record.findOne({
        attributes: [
            [db.fn('max', db.col('weight')), 'max'],
            [db.literal('SUM(weight*series*reps)', db.col('weight')), 'sum'],
            [db.fn('count', db.col('weight')), 'count']
        ],
        where: {
            uuid: req.user.uuid
        }
    }).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(err)
    })
})

app.use((error, req, res, next) => {

    res.status(error.status || 500)
    res.json({
        message: error.message,
        status: error.status
    })
})

app.listen(port, () => console.log("Server up", process.env))

