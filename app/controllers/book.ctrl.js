const Book = require("../models/Book.mdl");
const Review = require("../models/Review.mdl");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");

//@desc    Add a new book
//@route   POST /api/v1/book/add
//@access  Private
exports.addBook = asyncHandler(async (req, res) => {
  const { title = "", author = "", genre = "", description = "" } = req.body;

  // Validate required fields
  if (!title || !author || !genre) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Title, author, and genre are required."
    );
  }

  // Prevent duplicate book entries by title + author
  const existingBook = await Book.findOne({ title, author });
  if (existingBook) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "A book with this title and author already exists."
    );
  }

  // Create and save the new book
  const newBook = await Book.create({
    title,
    author,
    genre,
    description,
    addedBy: req.user_id, // Assumes authentication middleware sets this
  });

  // Respond with success status, no need to return the book object in this case
  res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, null, "Book added successfully")
    );
});

//@desc    Get all books with optional filtering and pagination
//@route   GET /api/v1/book/all
//@access  Public
exports.getAllBooks = asyncHandler(async (req, res) => {
  const { author, genre, page = 1, limit = 10 } = req.query;

  // Safely parse pagination parameters
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);

  // Build dynamic filter object
  const filter = {};
  if (author) {
    filter.author = { $regex: author, $options: "i" }; // case-insensitive search
  }
  if (genre) {
    filter.genre = genre;
  }

  // Fetch filtered and paginated book list + total count
  const [books, total] = await Promise.all([
    Book.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 }), // recent first
    Book.countDocuments(filter),
  ]);

  // Return paginated response
  res.status(StatusCodes.OK).json({
    success: true,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    count: books.length,
    books,
  });
});

//@desc    Get a single book by ID with its reviews
//@route   GET /api/v1/book/:id
//@access  Public
exports.getBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);

  // Ensure ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid book ID");
  }

  // Retrieve book details
  const book = await Book.findById(id).lean(); // lean() returns a plain JS object
  if (!book) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Book not found");
  }

  // Fetch paginated reviews, populate user info (username)
  const reviews = await Review.find({ bookId: id })
    .sort({ createdAt: -1 }) // newest first
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .populate("userId", "username");

  const totalReviews = await Review.countDocuments({ bookId: id });

  // Return book and its reviews
  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        book,
        reviews,
        totalReviews,
        page,
        totalPages: Math.ceil(totalReviews / limit),
      },
      "Book retrieved successfully"
    )
  );
});

//@desc    Submit a review for a book
//@route   POST /api/v1/book/:id/review
//@access  Private
exports.submitReview = asyncHandler(async (req, res) => {
  const { id: bookId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user_id;

  // Validate book ID
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid book ID");
  }

  // Validate rating value
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Rating must be a number between 1 and 5"
    );
  }

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Book not found");
  }

  // Prevent duplicate review by the same user
  const alreadyReviewed = await Review.findOne({
    bookId,
    userId,
  });

  if (alreadyReviewed) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "You have already reviewed this book"
    );
  }

  // Create and save new review
  const review = await Review.create({
    bookId: bookId,
    userId: userId,
    rating,
    comment,
  });

  // Respond with created review
  res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        review,
        "Review submitted successfully"
      )
    );
});

//@desc    Search books by title or author
//@route   GET /api/v1/book/search
//@access  Public
exports.searchBook = asyncHandler(async (req, res) => {
  const rawQuery = req.query.query?.trim();

  // Validate search input
  if (!rawQuery) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Query parameter is required");
  }

  // Case-insensitive regex search
  const regex = new RegExp(rawQuery, "i");

  // Return only selected fields to reduce payload size
  const books = await Book.find(
    {
      $or: [{ title: regex }, { author: regex }],
    },
    "title author genre"
  ).sort({ createdAt: -1 });

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, books, "Books retrieved successfully")
    );
});
