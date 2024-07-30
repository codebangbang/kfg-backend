const db = require('../db');

const OfficeLocation = db.define('OfficeLocation', {
    location: {
        type: STRING,
        allowNull: false,
        unique: true,
    },    });


module.exports = { OfficeLocation };