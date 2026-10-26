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
 * Task 10-13: Client functions that use Axios with Promise callbacks
 * and async/await to retrieve the books from the server endpoints above.
 */

// Task 10: Get all books - using async/await with Axios
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("All books:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error.message);
  }
};

// Task 11: Get book details based on ISBN - using Promise callbacks with Axios
const getBookByISBN = (isbn) => {
  return axios
    .get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      console.log(`Book with ISBN ${isbn}:`, response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
    });
};

// Task 12: Get book details based on author - using async/await with Axios
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Books by ${author}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by ${author}:`, error.message);
  }
};

// Task 13: Get book details based on title - using Promise callbacks with Axios
const getBooksByTitle = (title) => {
  return axios
    .get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      console.log(`Books with title ${title}:`, response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(`Error fetching books with title ${title}:`, error.message);
    });
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
