# 📚 Book Review API

A RESTful API for managing books and their reviews, built using **Node.js**, **Express**, **MongoDB**, and **JWT** authentication.

---

## 🚀 Features

- User signup & login with JWT authentication
- CRUD operations for books
- Add, update, and delete reviews (1 per user per book)
- Get book details with average rating and paginated reviews
- Search books by title or author (partial, case-insensitive)
- Pagination for books and reviews

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT for authentication
- bcrypt for password hashing
- dotenv for environment variables

---

## 📁 Project Structure

```
book-review-api/
├── app/
│   ├── configs/
│   │   └── db.js
│   ├── controllers/
│   │   ├── book.ctrl.js
│   │   ├── review.ctrl.js
│   │   └── user.ctrl.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── Book.mdl.js
│   │   ├── Review.mdl.js
│   │   └── User.mdl.js
│   ├── routes/
│   │   ├── book.route.js
│   │   ├── review.route.js
│   │   └── user.route.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── logger.js
│   ├── .env
│   ├── app.js
│   └── index.js
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
├── SCHEMA.md
└── README.md
```

---

## 🧪 API Endpoints

### 🔐 Authentication

| Method | Endpoint    | Description             |
| ------ | ----------- | ----------------------- |
| POST   | `/register` | Register a new user     |
| POST   | `/login`    | Login and get JWT token |

### 📚 Books

| Method | Endpoint             | Description                            |
| ------ | -------------------- | -------------------------------------- |
| POST   | `/books/add`         | Add a new book _(auth required)_       |
| GET    | `/books/all`         | Get all books (pagination + filters)   |
| GET    | `/books/:id`         | Get book details, avg rating + reviews |
| POST   | `/books/:id/reviews` | Submit review _(auth required)_        |

### ✍️ Reviews

| Method | Endpoint       | Description            |
| ------ | -------------- | ---------------------- |
| PUT    | `/reviews/:id` | Update your own review |
| DELETE | `/reviews/:id` | Delete your own review |

### 🔍 Search

| Method | Endpoint  | Description                     |
| ------ | --------- | ------------------------------- |
| GET    | `/search` | Search books by title or author |

---

## 🏁 Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/ashraf-g/book-review-api.git
   cd book-review-api
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Configure environment variables:**

   - Edit `app/.env` as needed.

4. **Start the server:**
   ```sh
   npm start
   ```

---

## 🧑‍💻 Example Requests

See the [Postman Collection](https://documenter.getpostman.com/view/32808632/2sB2qXkiRd) for example requests.

---

## 📄 License

[MIT](./LICENSE)
