"use strict";

//  This is my model for the User table in the database. It includes the following methods for user information: authenticate, register, findAll, get, update, remove.

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");



class User {
   static async authenticate(username, password) {
    
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
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }


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
}

//   static async applyToSkill(username, skill_id) {
//     const skillCheck = await db.query(
//       `SELECT skill_id
//            FROM skills
//            WHERE skill_id = $1`,
//       [skill_id]
//     );
//     const skill = skillCheck.rows[0];

//     if (!skill) throw new NotFoundError(`No skill: ${skill_id}`);

//     const userCheck = await db.query(
//       `SELECT username
//            FROM users
//            WHERE username = $1`,
//       [username]
//     );
//     const user = userCheck.rows[0];

//     if (!user) throw new NotFoundError(`No username: ${username}`);

//     await db.query(
//       `INSERT INTO user_skills (username, skill_id)
//            VALUES ($1, $2)`,
//       [username, skill_id]
//     );
//   }
// }


module.exports = User;
