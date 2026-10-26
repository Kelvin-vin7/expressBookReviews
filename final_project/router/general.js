const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

/* =====================================================================
 * Tasks 10 - 13: Retrieve books using Axios
 * (async/await and Promise callbacks)
 * ===================================================================== */

// Task 10: Get all books - using async/await with Axios
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving all books", error: error.message });
  }
});

// Task 11: Get book details based on ISBN - using Promise callbacks with Axios
public_users.get('/async/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => res.status(200).json(response.data))
    .catch((error) => {
      const status = error.response ? error.response.status : 500;
      res.status(status).json({ message: `Error retrieving book with ISBN ${isbn}` });
    });
});

// Task 12: Get book details based on author - using async/await with Axios
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: `Error retrieving books by author ${author}` });
  }
});

// Task 13: Get book details based on title - using Promise callbacks with Axios
public_users.get('/async/title/:title', (req, res) => {
  const title = req.params.title;
  axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => res.status(200).json(response.data))
    .catch((error) => {
      const status = error.response ? error.response.status : 500;
      res.status(status).json({ message: `Error retrieving books with title ${title}` });
    });
});

/* =====================================================================
 * Tasks 1 - 6: Book routes
 * ===================================================================== */

// Task 6: Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user. Username and password are required." });
  }
  if (!isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }
  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const booksbyauthor = Object.keys(books)
    .filter((isbn) => books[isbn].author.toLowerCase() === author)
    .map((isbn) => ({ isbn, author: books[isbn].author, title: books[isbn].title, reviews: books[isbn].reviews }));
  if (booksbyauthor.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor }, null, 4));
  }
  return res.status(404).json({ message: `No books found by author ${req.params.author}` });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const booksbytitle = Object.keys(books)
    .filter((isbn) => books[isbn].title.toLowerCase() === title)
    .map((isbn) => ({ isbn, author: books[isbn].author, title: books[isbn].title, reviews: books[isbn].reviews }));
  if (booksbytitle.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle }, null, 4));
  }
  return res.status(404).json({ message: `No books found with title ${req.params.title}` });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

module.exports.general = public_users;
