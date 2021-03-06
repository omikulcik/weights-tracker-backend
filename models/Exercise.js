const { DataTypes } = require("sequelize")
const db = require("../config/database")

const Exercise = db.define("Exercise", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
    }
})

module.exports = Exercise