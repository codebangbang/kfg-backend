const db = require('../db');

const Department = db.define('Department', {
    name: {
        type: STRING,
        allowNull: false,
        unique: true,
    },
    });

module.exports = { Department };