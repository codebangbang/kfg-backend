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

  static async create(skill_name, description) {
    const result = await db.query(
      `INSERT INTO skills (skill_name, description)
           VALUES ($1, $2)
           RETURNING skill_id, skill_name, description"`,
      [skill_name, description]
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

  static async findAll(queryParams = {}) {
    let { skill_name } = queryParams;
    let query = `SELECT skill_id, skill_name, description 
                 FROM skills`;
    let whereExpressions = [];
    let queryValues = [];

    if (skill_name !== undefined) {
      queryValues.push(`%${skill_name}%`);
      whereExpressions.push(`skill_name ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY skill_name";
    const result = await db.query(query, queryValues);

    return result.rows;
  }

  // /** Given a skill id, return data about skill.

  static async get(skill_id) {
    const skillRes = await db.query(
      `SELECT skill_id
                  skill_name,
                  description
           FROM skills
           WHERE skill_id = $1`,
      [skill_id]
    );

    const skill = skillRes.rows[0];

    if (!skill) throw new NotFoundError(`No skill: ${skill_id}`);

    return skill;
  }

  /** Update skill data with `data`.
   *
   */

  static async update(skill_id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      skill_name: "skill_name",
      description: "description",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE skills 
                      SET ${setCols} 
                      WHERE skill_id = ${idVarIdx} 
                      RETURNING skill_id, 
                                skill_name,
                                description`;
    const result = await db.query(querySql, [...values, skill_id]);
    const skill = result.rows[0];

    if (!skill) throw new NotFoundError(`No skill: ${skill_id}`);

    return skill;
  }

  /** Delete given skill from database; returns undefined.
   *
   * Throws NotFoundError if employee not found.
   **/

  static async remove(skill_id) {
    const result = await db.query(
      `DELETE
           FROM skills
           WHERE skill_id = $1
           RETURNING skill_id`,
      [skill_id]
    );
    const skill = result.rows[0];

    if (!skill) throw new NotFoundError(`No skill: ${skill_id}`);
  }
}

module.exports = Skill;
