const User = require("../models/User.mdl");
const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");

// @desc    Register a new user
// @route   POST /api/v1/user/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { username = "", email = "", password = "", role = "" } = req.body;

  // Ensure all required fields are present
  if (!username || !email || !password || !role) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please provide username, email, password, and role"
    );
  }

  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "User already exists with this email"
    );
  }

  // Check if username is already taken
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "User already exists with this username"
    );
  }

  // Create and save the new user (password should be hashed via pre-save hook)
  const newUser = await User.create({
    username,
    email,
    password,
    role,
  });

  // Send success response without user data for security
  res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, null, "User registered successfully")
    );
});

// @desc    Login user
// @route   POST /api/v1/user/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { identifier = "", password = "" } = req.body;

  // Ensure both identifier (email or username) and password are provided
  if (!identifier || !password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please provide email or username and password"
    );
  }

  // Attempt to find the user by email or username
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  // Verify user existence and password validity
  // `comparePassword` should return true if the password matches
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  // Generate JWT token with user ID and role
  const token = jwt.sign(
    {
      user_id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d", // token valid for 1 day
    }
  );

  // Set token as an HTTP-only secure cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Send back non-sensitive user data along with the token
  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        user: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      },
      "User logged in successfully"
    )
  );
});
