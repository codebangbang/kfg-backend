"use strict";

/** Routes for employees. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const employee = require("../models/employee");

const employeeNewSchema = require("../schemas/employeeNew.json");
const employeeUpdateSchema = require("../schemas/employeeUpdate.json");
const employeeSearchSchema = require("../schemas/employeeSearch.json");

const router = new express.Router();

/** POST / { employee } =>  { employee }
  *
  * employee should be { first_name, last_name, email, extension, ms_teams_link, department, office_location }
  *
  * Returns { first_name, last_name, email, extension, ms_teams_link, department, office_location }
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

  const employee = await employee.create(req.body);
  return res.status(201).json({ employee });
 }
  catch (err) {
    return next(err);
  }
});



// /** GET /  =>

router.get("/", async function (req, res, next) {
  const q = req.query;
  try {
    if (q.minEmployees !== undefined) q.minEmployees = +q.minEmployees;
    if (q.maxEmployees !== undefined) q.maxEmployees = +q.maxEmployees;

    const validator = jsonschema.validate(q, employeeSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const employees = await employee.findAll(q);
    return res.json({ employees });
  } catch (err) {
    return next(err);
  }
});



router.get("/:handle", async function (req, res, next) {
  try {
    const employee = await employee.get(req.params.handle);
    return res.json({ employee });
  } catch (err) {
    return next(err);
  }
});



router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, employeeUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const employee = await employee.update(req.params.handle, req.body);
    return res.json({ employee });
  } catch (err) {
    return next(err);
  }
});



router.delete ("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await employee.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
