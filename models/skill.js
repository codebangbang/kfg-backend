"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for employees. */

class skill {
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

  static async findAll({ skill_name, description } = {}) {
    let query = `SELECT s.skill_name,
                        s.description,  
                 FROM skills s `;
    let whereExpressions = [];
    let queryValues = [];

    // Finalize query and return results

    query += " ORDER BY skill_name";
    const skillsRes = await db.query(query, queryValues);
    return skillsRes.rows;
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
      `SELECT 
      
           FROM employees
           WHERE handle = $1`,
      [skill.employeeHandle]
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

module.exports = skill;
