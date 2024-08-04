const express = require("express");
const router = express.Router();
const db = require("../db");

// This is my departments.js file in the routes folder. It includes the following routes: /. 

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query("SELECT DISTINCT department FROM employees");
    const departments = result.rows.map(row => row.department);
    res.json({ departments });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
