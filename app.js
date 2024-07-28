"use strict";

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const employeesRoutes = require("./routes/employees");
const usersRoutes = require("./routes/users");
const skillsRoutes = require("./routes/skills");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/employees", employeesRoutes);
app.use("/users", usersRoutes);
app.use("/skills", skillsRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the KFG Backend API");
});

// app.get('/favicon.ico', (req, res) => res.status(204).end());

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  console.log(req.url);
  console.log(req.method);
  console.log(req.body);
  
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
