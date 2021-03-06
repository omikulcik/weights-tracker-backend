const db = require("../config/database")
const { DataTypes } = require("sequelize")
const Exercise = require("./Exercise")

const Record = db.define("Record", {
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    reps: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    series: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    uuid: {
        type: DataTypes.UUID,
        foreignKey: true
    }
})

Exercise.hasMany(Record, {
    foreignKey: {
        name: "exerciseId",
        allowNull: false
    }
})
Record.belongsTo(Exercise, {
    foreignKey: {
        name: "exerciseId",
        allowNull: false,
    }
})

module.exports = Record