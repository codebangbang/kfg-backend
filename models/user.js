"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, firstname, lastname, email, isadmin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT username,
                  password,
                  firstname,
                  lastname,
                  email,
                  isadmin
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstname, lastname, email, isadmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({
    username,
    password,
    firstname,
    lastname,
    email,
    isadmin,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (username,
            password,
            firstname,
            lastname,
            email,
            isadmin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, firstname, lastname, email, isadmin`,
      [username, hashedPassword, firstname, lastname, email, isadmin]
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, firstname, lastname, email, isadmin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT username,
                  firstname,
                  lastname,
                  email,
                  isadmin
           FROM users
           ORDER BY username`
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT username,
                  firstname,
                  lastname,
                  email,
                  isadmin
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstname, lastname, password, email, isadmin }
   *
   * Returns { username, firstname, lastname, email, isadmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstname: "firstname",
      lastname: "lastname",
      isadmin: "isadmin",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                firstname,
                                lastname,
                                email,
                                isadmin`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  static async applyToSkill(username, skill_id) {
    const skillCheck = await db.query(
      `SELECT skill_id
           FROM skills
           WHERE skill_id = $1`,
      [skill_id]
    );
    const skill = skillCheck.rows[0];

    if (!skill) throw new NotFoundError(`No skill: ${skill_id}`);

    const userCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );
    const user = userCheck.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    await db.query(
      `INSERT INTO user_skills (username, skill_id)
           VALUES ($1, $2)`,
      [username, skill_id]
    );
  }
}

module.exports = User;
