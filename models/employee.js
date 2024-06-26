"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Employee {
  static async create({
    first_name,
    last_name,
    email,
    extension,
    ms_teams_link,
    department,
    office_location,
  }) {
    const duplicateCheck = await db.query(
      `SELECT email
           FROM employees
           WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate employee: ${email}`);

    const result = await db.query(
      `INSERT INTO employees
           (first_name, last_name, email, extension, ms_teams_link, department, office_location)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, first_name, last_name, email, extension, ms_teams_link, department, office_location`,
      [
        first_name,
        last_name,
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

  static async get(id) {
    const employeeRes = await db.query(
      `SELECT id, first_name, last_name, email, extension, ms_teams_link, department, office_location
           FROM employees
           WHERE id = $1`,
      [id]
    );

    const employee = employeeRes.rows[0];

    if (!employee) {
      throw new NotFoundError(`No employee found with id: ${id}`);
    }
    return employee;
  }

  /** Update employee data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      teamsLink: "ms_teams_link",
      department: "department",
      officeLocation: "office_location",
    });

    const querySql = `UPDATE employees
                      SET ${setCols}
                      WHERE id = $${values.length + 1}
                      RETURNING id,
                                first_name,
                                last_name,
                                email,
                                extension,
                                ms_teams_link,
                                department,
                                office_location`;

    const result = await db.query(querySql, [...values, id]);
    const employee = result.rows[0];

    if (!employee) {
      throw new NotFoundError(`No employee found with id: ${id}`);
    }
    return employee;
  }

  /** Delete given employee from database; returns undefined.
   *
   * Throws NotFoundError if employee not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM employees
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const employee = result.rows[0];

    if (!employee) {
      throw new NotFoundError(`No employee with id: ${id}`);
    }
  }
}

module.exports = Employee;
