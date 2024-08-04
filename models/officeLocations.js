const db = require('../db');

// This is my model for the OfficeLocation table in the database.

const OfficeLocation = db.define('OfficeLocation', {
    location: {
        type: STRING,
        allowNull: false,
        unique: true,
    },    });


module.exports = { OfficeLocation };