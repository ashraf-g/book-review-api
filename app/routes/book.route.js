module.exports = (app) => {
  const express = require("express");
  const router = express.Router();
  const Book = require("../controllers/book.ctrl");

  const isAuthenticated = require("../middlewares/auth.middleware");

  const baseURL = process.env.BaseURL;

  router.post("/add", isAuthenticated, Book.addBook);
  router.get("/all", Book.getAllBooks);
  router.get("/search", Book.searchBook);
  router.get("/:id", Book.getBookById);
  router.post("/:id/reviews", isAuthenticated, Book.submitReview);

  app.use(`${baseURL}/books`, router);
};
