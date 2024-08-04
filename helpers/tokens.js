const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// This is my helper function to create a token. It takes in a user object and returns a token.

function createToken(user) {
  console.assert(
    user.isadmin !== undefined,
    "createToken passed user without isadmin property"
  );

  console.log("Creating token with user: ", user);

  let payload = {
    username: user.username,
    isadmin: user.isadmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
