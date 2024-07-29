"use strict";

/** Routes for skills. */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Skill = require("../models/skill");
const Employee = require("../models/employee");

const skillNewSchema = require("../schemas/skillNew.json");
const skillUpdateSchema = require("../schemas/skillUpdate.json");
const skillSearchSchema = require("../schemas/skillSearch.json");

const router = express.Router({ mergeParams: true });

/** POST / { skill } => { skill }
 *
 * skill should be { skill_name, description }
 *
 *
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, skillNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const newSkill = await Skill.create(req.body);
    return res.status(201).json({ skill: newSkill });
  } catch (err) {
    return next(err);
  }
});

router.get("/", async function (req, res, next) {
  try {
    const q = req.query;
    if (q.skill_name) q.skill_name = q.skill_name.toLowerCase();

    const validator = jsonschema.validate(q, skillSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const skillList = await Skill.findAll(q);
    return res.json({ skills: skillList });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const fetchedSkill = await Skill.get(req.params.id);
    return res.json({ skill: fetchedSkill });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, skillUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const updatedSkill = await Skill.update(req.params.id, req.body);
    return res.json({ skill: updatedSkill });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Skill.remove(req.params.id);
    return res.json({ message: "Skill deleted" });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/employees", async function (req, res, next) {
  const { id } = req.params;
  try {
    const employees = await Employee.findBySkill(id);
    if (!employees.length) {
      return res.json({ message: "No employees found with this skill" });
    }
    return res.json({ employees });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
