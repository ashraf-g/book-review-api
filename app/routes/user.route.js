module.exports = (app) => {
  const express = require("express");
  const router = express.Router();
  const User = require("../controllers/user.ctrl");

  const baseURL = process.env.BaseURL;

  router.post("/register", User.register);
  router.post("/login", User.login);

  app.use(`${baseURL}/user`, router);
};
