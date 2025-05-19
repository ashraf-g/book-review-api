module.exports = (app) => {
  const express = require("express");
  const router = express.Router();
  const Review = require("../controllers/review.ctrl");

  const isAuthenticated = require("../middlewares/auth.middleware");

  const baseURL = process.env.BaseURL;

  router.put("/:id", Review.update);
  router.delete("/:id", Review.delete);

  app.use(isAuthenticated);

  app.use(`${baseURL}/reviews`, router);
};
