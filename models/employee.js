"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Employee {
  static async create(data) {
    const result = await db.query(
      `INSERT INTO employees
           (employee_id, firstname, lastname, email, extension, ms_teams_link, department, office_location)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING employee_id firstname, lastname, email, extension, ms_teams_link, department, office_location`,
      [
        employee_id,
        firstname,
        lastname,
        email,
        extension,
        ms_teams_link,
        department,
        office_location,
      ]
    );
    const employee = result.rows[0];

    return employee;
  }

  static async findAll({ firstname, lastname, email, department }) {
    let query = `SELECT employee_id,
                        firstname,
                        lastname,
                        email,
                        extension,
                        ms_teams_link,
                        department,
                        office_location
                 FROM employees`;
    let whereExpressions = [];
    let queryValues = [];

    if (firstname !== undefined) {
      queryValues.push(`%${firstname}%`);
      whereExpressions.push(`firstname ILIKE $${queryValues.length}`);
    }

    if (lastname !== undefined) {
      queryValues.push(`%${lastname}%`);
      whereExpressions.push(`lastname ILIKE $${queryValues.length}`);
    }

    if (email !== undefined) {
      queryValues.push(`%${email}%`);
      whereExpressions.push(`email ILIKE $${queryValues.length}`);
    }

    if (department !== undefined) {
      queryValues.push(`%${department}%`);
      whereExpressions.push(`department ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY lastname";
    const empRes = await db.query(query, queryValues);
    return empRes.rows;
  }

  static async get(employee_id) {
    const empRes = await db.query(
      `SELECT employee_id, firstname, lastname, email, extension, ms_teams_link, department, office_location
           FROM employees
           WHERE employee_id = $1`,
      [employee_id]
    );

    const employee = empRes.rows[0];

    if (!employee) {
      throw new NotFoundError(`No employee found with id: ${employee_id}`);
    }

    return employee;
  }

  static async update(employee_id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});

    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE employees
                      SET ${setCols}
                      WHERE employee_id = ${idVarIdx}
                      RETURNING employee_id,
                                firstname,
                                lastname,
                                email,
                                extension,
                                ms_teams_link,
                                department,
                                office_location`;

    const result = await db.query(querySql, [...values, employee_id]);
    const employee = result.rows[0];

    if (!employee) {
      throw new NotFoundError(`No employee found with id: ${employee_id}`);
    }
    return employee;
  }

  /** Delete given employee from database; returns undefined.
   *
   * Throws NotFoundError if employee not found.
   **/

  static async remove(employee_id) {
    const result = await db.query(
      `DELETE
           FROM employees
           WHERE employee_id = $1
           RETURNING employee_id`,
      [employee_id]
    );
    const employee = result.rows[0];

    if (!employee) {
      throw new NotFoundError(`No employee with id: ${employee_id}`);
    }
  }

  static async findBySkill(skill_id) {
    const employeeRes = await db.query(
      `SELECT e.employee_id,
              e.firstname,
              e.lastname,
              e.email,
              e.extension,
              e.ms_teams_link,
              e.department,
              e.office_location
           FROM employees AS e
           JOIN employee_skills AS es
           ON e.employee_id = es.employee_id
           WHERE es.skill_id = $1`,
      [skill_id]
    );

    return employeeRes.rows;
  }

  static async getSkills(employee_id) {
    const skillsRes = await db.query(
      `SELECT s.skill_id, s.skill_name
           FROM skills s
           JOIN employee_skills es ON s.skill_id = es.skill_id
           WHERE es.employee_id = $1`,
      [employee_id]
    );

    return skillsRes.rows;
  }
}

module.exports = Employee;
