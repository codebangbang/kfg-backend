const express = require("express");
const router = express.Router();
const db = require("../db");

// This is my officeLocations.js file in the routes folder. It includes the following routes: /.

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      "SELECT DISTINCT office_location FROM employees"
    );
    const officeLocations = result.rows.map((row) => row.office_location);
    res.json({ officeLocations });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
