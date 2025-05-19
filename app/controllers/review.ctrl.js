const Book = require("../models/Book.mdl");
const Review = require("../models/Review.mdl");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");

//@desc     Update a review
//@route    PUT /api/v1/review/:id
//@access   Private
exports.update = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user_id;

  // Validate review ID format
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid review ID");
  }

  // Validate rating value (1-5)
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Rating must be a number between 1 and 5"
    );
  }

  // Check if review exists
  const review = await Review.findById(reviewId).lean();
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
  }

  // Ensure the requesting user is the owner of the review
  if (review.userId.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this review"
    );
  }

  // Update review and return updated version
  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { rating, comment },
    { new: true } // return the updated document
  ).lean();

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        updatedReview,
        "Review updated successfully"
      )
    );
});

//@desc     Delete a review
//@route    DELETE /api/v1/review/:id
//@access   Private
exports.delete = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;
  const userId = req.user_id;

  // Validate review ID format
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid review ID");
  }

  // Check if review exists
  const review = await Review.findById(reviewId).lean();
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
  }

  // Ensure the requesting user is the owner of the review
  if (review.userId.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this review"
    );
  }

  // Delete review from the database
  await Review.findByIdAndDelete(reviewId);

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Review deleted successfully"));
});
