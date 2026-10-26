const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

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

// Get the book list available in the shop (using a Promise)
public_users.get('/',function (req, res) {
  new Promise((resolve) => {
    resolve(books);
  }).then((bookList) => {
    res.status(200).send(JSON.stringify(bookList, null, 4));
  });
});

// Get book details based on ISBN (using a Promise)
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(`Book with ISBN ${isbn} not found`);
    }
  })
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
 });
  
// Get book details based on author (using async/await)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const getByAuthor = () => new Promise((resolve) => {
    const result = Object.keys(books)
      .filter((isbn) => books[isbn].author.toLowerCase() === author.toLowerCase())
      .map((isbn) => ({ isbn, author: books[isbn].author, title: books[isbn].title, reviews: books[isbn].reviews }));
    resolve(result);
  });

  const booksbyauthor = await getByAuthor();
  if (booksbyauthor.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor }, null, 4));
  }
  return res.status(404).json({ message: `No books found by author ${author}` });
});

// Get all books based on title (using async/await)
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const getByTitle = () => new Promise((resolve) => {
    const result = Object.keys(books)
      .filter((isbn) => books[isbn].title.toLowerCase() === title.toLowerCase())
      .map((isbn) => ({ isbn, author: books[isbn].author, title: books[isbn].title, reviews: books[isbn].reviews }));
    resolve(result);
  });

  const booksbytitle = await getByTitle();
  if (booksbytitle.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle }, null, 4));
  }
  return res.status(404).json({ message: `No books found with title ${title}` });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

/*
 * Tasks 10-13: Retrieve books using Axios with async/await and Promise callbacks.
 * Each helper calls the book endpoints above through Axios, and each one is
 * exposed through its own route so it can be tested with curl.
 */

// Task 10: Get the list of all books - async/await with Axios
const getAllBooks = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

// Task 11: Get book details based on ISBN - Promise callbacks with Axios
const getBookByISBN = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`).then((response) => response.data);
};

// Task 12: Get book details based on author - async/await with Axios
const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

// Task 13: Get book details based on title - Promise callbacks with Axios
const getBooksByTitle = (title) => {
  return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`).then((response) => response.data);
};

// Route for Task 10: all books using async/await with Axios
public_users.get('/async/books', async (req, res) => {
  try {
    const data = await getAllBooks();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Route for Task 11: book by ISBN using Promise callbacks with Axios
public_users.get('/async/isbn/:isbn', (req, res) => {
  getBookByISBN(req.params.isbn)
    .then((data) => res.status(200).json(data))
    .catch((error) => {
      const status = error.response ? error.response.status : 500;
      res.status(status).json({ message: `Error retrieving book with ISBN ${req.params.isbn}` });
    });
});

// Route for Task 12: books by author using async/await with Axios
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const data = await getBooksByAuthor(req.params.author);
    return res.status(200).json(data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: `Error retrieving books by author ${req.params.author}` });
  }
});

// Route for Task 13: books by title using Promise callbacks with Axios
public_users.get('/async/title/:title', (req, res) => {
  getBooksByTitle(req.params.title)
    .then((data) => res.status(200).json(data))
    .catch((error) => {
      const status = error.response ? error.response.status : 500;
      res.status(status).json({ message: `Error retrieving books with title ${req.params.title}` });
    });
});

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
