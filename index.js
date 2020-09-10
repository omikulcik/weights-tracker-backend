const db = require("./config/database")
const express = require("express")
const Exercise = require("./models/Exercise")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")

app.use(cors())
app.use(bodyParser.json())

db.authenticate().then(() => {
    /*     db.sync({ force: true }) */
    console.log("db connected")

}).catch((err) => {
    console.log("database error", err)
})

app.post("/createExercise", (req, res) => {
    Exercise.create({
        name: req.body.name
    })
        .then(result => res.send(result))
        .catch((err) => res.send(err))
})

app.get("/getExercises", (req, res) => {
    Exercise.findAll()
        .then(result => res.send(result))
        .catch(err => res.send(err))
})

app.listen(3000, () => console.log("Server up"))