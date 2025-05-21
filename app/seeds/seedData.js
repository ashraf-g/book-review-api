const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("../models/User.mdl");
const Book = require("../models/Book.mdl");
const Review = require("../models/Review.mdl");

dotenv.config();

const mongoURI = process.env.MONGO_URI;

const genres = [
  "Fiction",
  "Non-fiction",
  "Fantasy",
  "Science Fiction",
  "Mystery",
];
const comments = [
  "Great read!",
  "I couldn't put it down.",
  "Interesting perspective.",
  "Well-written but a bit slow.",
  "Not my favorite, but worth reading.",
  "Loved the characters and storyline.",
  "A bit predictable, but still enjoyable.",
  "Couldn't finish it, too boring.",
  "An absolute page-turner!",
  "A masterpiece of storytelling.",
];

// Helper to get random item from an array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Optional: clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});

    // Seed 25 users
    const users = [];
    for (let i = 1; i <= 25; i++) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`Password${i}!`, salt);

      const user = new User({
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        role: i % 5 === 0 ? "moderator" : "reader", // Every 5th user is a moderator
      });
      await user.save();
      users.push(user);
    }

    console.log("Users seeded successfully");

    // Seed 50 books
    const books = [];
    for (let i = 1; i <= 50; i++) {
      const book = new Book({
        title: `Sample Book ${i}`,
        author: `Author ${i}`,
        genre: getRandomItem(genres),
        description: `This is a description for Sample Book ${i}.`,
        addedBy: getRandomItem(users)._id, // Random user added the book
      });
      await book.save();
      books.push(book);
    }

    console.log("Books seeded successfully");

    // Seed 200+ reviews for books
    let reviewCount = 0;
    for (let book of books) {
      const numberOfReviews = Math.floor(Math.random() * 5) + 4; // 4–8 reviews per book to get 200+ reviews
      for (let i = 0; i < numberOfReviews; i++) {
        const user = getRandomItem(users);
        const review = new Review({
          bookId: book._id,
          userId: user._id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: getRandomItem(comments),
        });
        await review.save();
        reviewCount++;
      }
    }

    console.log(`${reviewCount} reviews seeded successfully`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedData();
