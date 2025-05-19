BOOK REVIEW SYSTEM SCHEMA

USER (\_id)

- username (string, unique)
- email (string, unique)
- password (string, hashed)
- role ("reader"|"moderator")
- timestamps

BOOK (\_id)

- title (string)
- author (string)
- genre (string)
- description (string)
- addedBy (USER.\_id)
- timestamps

REVIEW (\_id)

- bookId (BOOK.\_id)
- userId (USER.\_id)
- rating (1-5)
- comment (string)
- timestamps

RELATIONSHIPS:

- 1 USER → MANY BOOKS
- 1 USER → MANY REVIEWS
- 1 BOOK → MANY REVIEWS

INDEXES:

- [UNIQUE] USER: username, email
- [INDEX] BOOK: addedBy
- [INDEX] REVIEW: bookId, userId
