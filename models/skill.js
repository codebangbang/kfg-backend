"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for employees. */

class Skill {
  static async create(data) {
    const result = await db.query(
      `INSERT INTO skills (skill_name, description)
           VALUES ($1, $2)
           RETURNING skill_id, skill_name, description"`,
      [data.skill_name, data.description]
    );
    let skill = result.rows[0];

    return skill;
  }

  static async findAll({ skill_name }) {
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

    // Finalize query and return results

    query += " ORDER BY skill_name";
    const skillRes = await db.query(query, queryValues);
    return skillRes.rows;
  }

  // /** Given a skill id, return data about skill.

  static async get(skill_id) {
    const skillRes = await db.query(
      `SELECT skill_id
                  skill_name,
                  description
           FROM skills
           WHERE skill_id = $1`, [skill_id]
    );

    const skill = skillRes.rows[0];

    if (!skill) throw new NotFoundError(`No skill: ${skill_id}`);

    return skill;
  }

  /** Update skill data with `data`.
   *
   */

  static async update(skill_id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, 
      {});
    
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
