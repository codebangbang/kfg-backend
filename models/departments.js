const db = require('../db');

// This is my model for the Department table in the database.

const Department = db.define('Department', {
    name: {
        type: STRING,
        allowNull: false,
        unique: true,
    },
    });

module.exports = { Department };