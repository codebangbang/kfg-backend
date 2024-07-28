"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Employee {
  static async create(data) {

    const result = await db.query(
      `INSERT INTO employees
           (employee_id, firstName, lastName, email, extension, ms_teams_link, department, office_location)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING employee_id AS employeeId, firstName, lastName, email, extension, ms_teams_link AS msTeamsLink, department, office_location AS officeLocation`,
      [
        employee_id,
        firstName,
        lastName,
        email,
        extension,
        msTeamsLink,
        department,
        officeLocation,
      ]
    );
    const employee = result.rows[0];

    return employee;
  }

  static async findAll({ firstName, lastName, email, department }) {
    let query = `SELECT employee_id,
                        firstName,
                        lastName,
                        email,
                        extension,
                        ms_teams_link,
                        department,
                        office_location
                 FROM employees`;
    let whereExpressions = [];
    let queryValues = [];

    if (firstName !== undefined) {
      queryValues.push(`%${firstName}%`);
      whereExpressions.push(`firstName ILIKE $${queryValues.length}`);
    }

    if (lastName !== undefined) {
      queryValues.push(`%${lastName}%`);
      whereExpressions.push(`lastName ILIKE $${queryValues.length}`);
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

    query += " ORDER BY lastName";
    const empRes = await db.query(query, queryValues);
    return empRes.rows;
  }

  static async get(employee_id) {
    const empRes = await db.query(
      `SELECT employee_id, firstName, lastName, email, extension, ms_teams_link, department, office_location
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
    const { setCols, values } = sqlForPartialUpdate(data, 
      {});

    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE employees
                      SET ${setCols}
                      WHERE employee_id = ${idVarIdx}
                      RETURNING employee_id AS "employeeId",
                                firstName,
                                lastName,
                                email,
                                extension,
                                ms_teams_link AS "msTeamsLink",
                                department,
                                office_location AS "officeLocation"`;

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
           RETURNING employee_id as "employeeId"`,
      [employee_id]
    );
    const employee = result.rows[0];

    if (!employee) {
      throw new NotFoundError(`No employee with id: ${employee_id}`);
    }
  }
}

module.exports = Employee;
