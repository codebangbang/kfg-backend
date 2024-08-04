"use strict";

// This is my middleware function to authenticate a user using a JWT token.

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers && req.headers.authorization;
    // console.log("Authorization Header: ", authHeader);
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      // console.log("Token Received: ", token);
      res.locals.user = jwt.verify(token, SECRET_KEY);
      // console.log("User decoded from token: ", res.locals.user);
    }
    return next();
  } catch (err) {
    console.error("Error in authenticateJWT: ", err);
    return next();
  }
};

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureAdmin(req, res, next) {
  try {
    console.log("User in ensureAdmin:", res.locals.user);
    if (!res.locals.user || !res.locals.user.isadmin) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    console.error("Error in ensureAdmin: ", err);
    return next(err);
  }
}

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && (user.isadmin || user.username === req.params.username))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
};
