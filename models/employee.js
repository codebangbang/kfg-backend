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
  }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM employees
           WHERE handle = $1`,
      [email]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO employees
           first_name, last_name, email, extension, ms_teams_link, department)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING first_name, last_name, email, extension, ms_teams_link, department`,
      [first_name, last_name, email, extension, ms_teams_link, department]
    );
    const company = result.rows[0];

    return company;
  }

  static async findAll() {
    let query = `SELECT first_name, last_name, email, extension, ms_teams_link, department
                   FROM companies`;
    let whereExpressions = [];
    let queryValues = [];

    // const { minEmployees, maxEmployees, name } = searchFilters;

    // if (minEmployees > maxEmployees) {
    //   throw new BadRequestError("Min employees cannot be greater than max");
    // }

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL

    if (first_name !== undefined) {
      queryValues.push(first_name);
      whereExpressions.push(`first_name >= $${queryValues.length}`);
    }

    if (last_name !== undefined) {
      queryValues.push(last_name);
      whereExpressions.push(`num_employees <= $${queryValues.length}`);
    }

    if (email) {
      queryValues.push(`%${email}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY name";
    const companiesRes = await db.query(query, queryValues);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const employeeRes = await db.query(
      `SELECT handle,
                  first_name, last_name, email, extension, ms_teams_link, department
           FROM employees
           WHERE handle = $1)`,
      [handle]
    );

    const employee = employeeRes.rows[0];

    if (!employee) throw new NotFoundError(`No employee: ${handle}`);

    await db.query(
      `SELECT first_name, last_name, email, extension, ms_teams_link, department
               FROM employees
               WHERE company_handle = $1
               ORDER BY id`,
      [handle]
    );

    return employee;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Employee;
