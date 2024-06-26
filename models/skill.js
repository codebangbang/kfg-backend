"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for employees. */

class Skill {
  /** Create a skill (from data), update db, return new skill data.
   *
   * data should be { skill_name, description }
   *
   * Returns { id, skill_name, description }
   **/

  static async create(data) {
    const result = await db.query(
      `INSERT INTO skills (skill_name, description)
           VALUES ($1, $2)
           RETURNING id, skill_name, description"`,
      [data.skill_name, data.description]
    );
    let skill = result.rows[0];

    return skill;
  }

  /** Find all skills (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - skill_name (will find case-insensitive, partial matches)
   *
   * Returns [{ id, skill_name, description }, ...]
   * */

  static async findAll(queryParams) {
    let { skill_name } = queryParams;
    let query = `SELECT * 
                 FROM skills
                 WHERE skill_name = $1`;
    try {
      const result = await db.query(query, [skill_name]);
      return result.rows;
    } catch (err) {
      throw new Error("Error querying skills: ${err.message}");
    }
  }

  // /** Given a skill id, return data about skill.

  static async get(id) {
    const skillRes = await db.query(
      `SELECT id,
                  skill_name AS "skillName",
                  description,
           FROM skills
           WHERE id = $1`,
      [id]
    );

    const skill = skillRes.rows[0];

    if (!skill) throw new NotFoundError(`No skill: ${id}`);

    const employeesRes = await db.query(
      `SELECT id,      
           FROM employees
           WHERE id = $1`,
      [skill.employee.id]
    );

    delete skill.employeeHandle;
    skill.employee = employeesRes.rows[0];

    return skill;
  }

  /** Update skill data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, employeeHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE skills 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                employee_handle AS "employeeHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const skill = result.rows[0];

    if (!skill) throw new NotFoundError(`No skill: ${id}`);

    return skill;
  }

  /** Delete given skill from database; returns undefined.
   *
   * Throws NotFoundError if employee not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM skills
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const skill = result.rows[0];

    if (!skill) throw new NotFoundError(`No skill: ${id}`);
  }
}

module.exports = Skill;
