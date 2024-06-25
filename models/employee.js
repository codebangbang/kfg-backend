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
           RETURNING first_name AS "firstName", last_name AS "lastName", email, extension, ms_teams_link AS "teamsLink", department, office_location AS "officeLocation"`,
      [
        firstName,
        lastName,
        email,
        extension,
        teamsLink,
        department,
        officeLocation,
      ]
    );
    const employee = result.rows[0];

    return employee;
  }

  // static async findAll(searchFilters = {}) {
  //   let query = `SELECT first_name AS "firstName", last_name AS "lastName, email, extension, ms_teams_link AS "teamsLink", department, office_location AS "officeLocation"
  //                FROM employees`;
  //   let whereExpressions = [];
  //   let queryValues = [];

  //   const { first_name } = searchFilters;

  // For each possible search term, add to whereExpressions and queryValues so
  // we can generate the right SQL

  // if (first_name !== undefined) {
  //   queryValues.push(first_name);
  //   whereExpressions.push(`first_name >= $${queryValues.length}`);
  // }

  // if (last_name !== undefined) {
  //   queryValues.push(last_name);
  //   whereExpressions.push(`num_employees <= $${queryValues.length}`);
  // }

  // if (email) {
  //   queryValues.push(`%${email}%`);
  //   whereExpressions.push(`name ILIKE $${queryValues.length}`);
  // }

  // if (whereExpressions.length > 0) {
  //   query += " WHERE " + whereExpressions.join(" AND ");
  // }

  // Finalize query and return results

  // query += " ORDER BY name";
  // const companiesRes = await db.query(query, queryValues);
  // return companiesRes.rows;
  // }

  /** Given a employee id, return data about employee.
   *
   * Returns { first_name, last_name, email, extension, ms_teams_link, department, office_location }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const employeeRes = await db.query(
      `SELECT id, first_name, last_name, email, extension, ms_teams_link, department, office_location
           FROM employees
           WHERE id = $1`,
      [id]
    );

    const employee = employeeRes.rows[0];

    if (!employee) throw new NotFoundError(`No employee: ${handle}`);
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
    const handleVarIdx = "$" + (values.length + 1);

    // const querySql = `UPDATE employees
    //                   SET ${setCols}
    //                   WHERE handle = ${handleVarIdx}
    //                   RETURNING handle,
    //                             first_name,
    //                             last_name,
    //                             email,
    //                             extension,
    //                             ms_teams_link,
    //                             department`;
    // const result = await db.query(querySql, [...values, handle]);
    // const employee = result.rows[0];

    if (!employee) throw new NotFoundError(`No employee: ${handle}`);

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

    if (!employee) throw new NotFoundError(`No employee: ${id}`);
  }
}

module.exports = Employee;
