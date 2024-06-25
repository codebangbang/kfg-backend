"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for employees. */

class skill {
  /** Create a skill (from data), update db, return new skill data.
   *
   * data should be { title, salary, equity, employeeHandle }
   *
   * Returns { id, title, salary, equity, employeeHandle }
   **/

  static async create(data) {
    const result = await db.query(
      `INSERT INTO skills (title,
                             salary,
                             equity,
                             employee_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, employee_handle AS "employeeHandle"`,
      [data.title, data.salary, data.equity, data.employeeHandle]
    );
    let skill = result.rows[0];

    return skill;
  }

  /** Find all skills (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - minSalary
   * - hasEquity (true returns only skills with equity > 0, other values ignored)
   * - title (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, salary, equity, employeeHandle, employeeName }, ...]
   * */

  static async findAll({ minSalary, hasEquity, title } = {}) {
    let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.employee_handle AS "employeeHandle",
                        c.name AS "employeeName"
                 FROM skills j 
                   LEFT JOIN employees AS c ON c.handle = j.employee_handle`;
    let whereExpressions = [];
    let queryValues = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
      whereExpressions.push(`equity > 0`);
    }

    if (title !== undefined) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY title";
    const skillsRes = await db.query(query, queryValues);
    return skillsRes.rows;
  }

  /** Given a skill id, return data about skill.
   *
   * Returns { id, title, salary, equity, employeeHandle, employee }
   *   where employee is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const skillRes = await db.query(
      `SELECT id,
                  title,
                  salary,
                  equity,
                  employee_handle AS "employeeHandle"
           FROM skills
           WHERE id = $1`,
      [id]
    );

    const skill = skillRes.rows[0];

    if (!skill) throw new NotFoundError(`No skill: ${id}`);

    const employeesRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
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
