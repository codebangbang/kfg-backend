"use strict";

/** Routes for employees. */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Employee = require("../models/employee");

const employeeNewSchema = require("../schemas/employeeNew.json");
const employeeUpdateSchema = require("../schemas/employeeUpdate.json");
const employeeSearchSchema = require("../schemas/employeeSearch.json");

const router = express.Router();

/** POST / { employee } =>  { employee }
 *
 * employee should be { firstName, lastName, email, extension, ms_teams_link, department, office_location }
 *
 * Returns { firstName, lastName, email, extension, ms_teams_link, department, office_location }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, employeeNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const newEmployee = await Employee.create(req.body);
    return res.status(201).json({ employee: newEmployee });
  } catch (err) {
    return next(err);
  }
});

// /** GET /  =>

router.get("/", async function (req, res, next) {
  try {
    const q = req.query;
    const validator = jsonschema.validate(q, employeeSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const employeesList = await Employee.findAll(q);
    return res.json({ employees: employeesList });
  } catch (err) {
    return next(err);
  }
});

router.get("/:employee_id", async function (req, res, next) {
  try {
    const fetchedEmployee = await Employee.get(req.params.employee_id);
    return res.json({ employee: fetchedEmployee });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:employee_id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, employeeUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const updatedEmployee = await Employee.update(
      req.params.employee_id,
      req.body
    );
    return res.json({ employee: updatedEmployee });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:employee_id", ensureAdmin, async function (req, res, next) {
  try {
    await Employee.remove(req.params.employee_id);
    return res.json({ deleted: req.params.employee_id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
