const { Sequelize } = require("sequelize")
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


module.exports = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});
