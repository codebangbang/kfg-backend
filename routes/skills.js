"use strict";

/** Routes for skills. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const skill = require("../models/skill");
const skillNewSchema = require("../schemas/skillNew.json");
const skillUpdateSchema = require("../schemas/skillUpdate.json");
const skillSearchSchema = require("../schemas/skillSearch.json");

const router = express.Router({ mergeParams: true });

/** POST / { skill } => { skill }
 *
 * skill should be { title, salary, equity, employeeHandle }
 *
 * Returns { id, title, salary, equity, employeeHandle }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, skillNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const skill = await skill.create(req.body);
    return res.status(201).json({ skill });
  } catch (err) {
    return next(err);
  }
});

/** GET / =>
 *   { skills: [ { id, title, salary, equity, employeeHandle, employeeName }, ...] }
 *
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity (true returns only skills with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)

 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;
  // arrive as strings from querystring, but we want as int/bool
  if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
  q.hasEquity = q.hasEquity === "true";

  try {
    const validator = jsonschema.validate(q, skillSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const skills = await skill.findAll(q);
    return res.json({ skills });
  } catch (err) {
    return next(err);
  }
});

/** GET /[skillId] => { skill }
 *
 * Returns { id, title, salary, equity, employee }
 *   where employee is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const skill = await skill.get(req.params.id);
    return res.json({ skill });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[skillId]  { fld1, fld2, ... } => { skill }
 *
 * Data can include: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, employeeHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, skillUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const skill = await skill.update(req.params.id, req.body);
    return res.json({ skill });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await skill.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
