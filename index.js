const db = require("./config/database")
const express = require("express")
const Exercise = require("./models/Exercise")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const Record = require("./models/Record")

app.use(cors())
app.use(bodyParser.json())

db.authenticate().then(() => {
    /* db.sync({ force: true }) */
    console.log("db connected")

}).catch((err) => {
    console.log("database error", err)
})

app.post("/addExercise", (req, res) => {
    Exercise.create({
        name: req.body.name,
        isDeleted: false
    })
        .then(result => res.send(result))
        .catch((err) => res.send(err))
})

app.get("/getExercises", (req, res) => {
    Exercise.findAll({
        where: {
            isDeleted: false
        }
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

app.listen(3000, () => console.log("Server up"))