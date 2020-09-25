const db = require("../config/database")
const { DataTypes } = require("sequelize")
const { v4: uuid } = require("uuid")

const User = db.define("User", {
    uuid: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

User.beforeCreate(user => user.uuid = uuid())

module.exports = User