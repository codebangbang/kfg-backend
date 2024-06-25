"use strict";

/** Routes for skills. */

import jsonschema from "jsonschema";
import express from "express";
import { BadRequestError } from "../expressError";
import { ensureAdmin } from "../middleware/auth";
import skillNewSchema from "../schemas/skillNew.json";
import skillSearchSchema from "../schemas/skillSearch.json";

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

    const skill = await skill.create(req.body);
    return res.status(201).json({ skill });
  } catch (err) {
    return next(err);
  }
});

router.get("/", async function (req, res, next) {
  const q = req.query;
  if (q.skill_name) q.skill_name = q.skill_name.toLowerCase();
  try {
    const validator = jsonschema.validate(q, skillSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const skills = await skills.findAll(q);
    return res.json({ skills });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const skill = await skill.get(req.params.id);
    return res.json({ skill });
  } catch (err) {
    return next(err);
  }
});

export default router;
