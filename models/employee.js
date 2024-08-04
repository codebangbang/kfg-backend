"use strict";

// This is my model for the Employee table in the database. It includes the following methods for employee information: create, findAll, get, update, remove, findBySkill, getSkills. 

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

  static async findAll(query) {
    const search = query.search || '';
    const employees = await db.query(
      `SELECT * FROM employees 
      WHERE firstname ILIKE $1 
      OR lastname ILIKE $1 
      OR email ILIKE $1 
      OR department ILIKE $1 
      OR extension ILIKE $1
      OR office_location ILIKE $1`,
    [`%${search}%`]
    );
    return employees.rows;
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
