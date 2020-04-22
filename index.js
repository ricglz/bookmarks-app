const authorization = require('./middleware/authorization');
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');

const app = express();
const jsonParser = bodyParser.json();
app.use(morgan('dev'));
app.use(authorization);

function createBookmark(title, description, url, rating) {
  return {
    id: uuid.v4(),
    title,
    description,
    url,
    rating
  };
}

const bookmarks = [
  createBookmark('Hola', 'Mundo', 'http://google.com', 4),
  createBookmark('Que', 'Tal?', 'http://facebook.com', 5),
  createBookmark('Adiós', 'Mundo', 'http://twitter.com', 4),
]

app.get('/bookmarks', (_, res) => (
  res.status(200).json(bookmarks)
));

function errorMessage(res, statusMessage, status) {
  res.statusMessage = statusMessage;
  return res.status(status).end();
}

function notFoundErrorMessage(res, field) {
  return errorMessage(res,
    `Not found: No bookmark was found with that ${field}`, 404);
}

function parameterMissingError(res, field) {
  return errorMessage(res, `Parameter missing: ${field} was not sent`, 406);
}

app.get('/bookmark', (req, res) => {
  const { title } = req.query;
  if(!title) {
    return parameterMissingError(res, 'Title');
  }
  const bookmarksAnswer = bookmarks.filter((bookmark) => bookmark.title === title);
  if(bookmarksAnswer.length === 0) {
    return notFoundErrorMessage(res, 'title');
  }
  return res.status(200).json(bookmarksAnswer);
});

app.post('/bookmarks', (req, res) => {
  const fields = ['title', 'description', 'url', 'rating'];
  const { query } = req;
  for(let i = 0; i < 4; i++) {
    const searchedField = fields[i], field = query[searchedField];
    if(!field) {
      return parameterMissingError(res, searchedField);
    }
  }
  const { title, description, url, rating } = query;
  const bookmark = createBookmark(title, description, url, rating);
  bookmarks.push(bookmark);
  return res.status(201).json(bookmark);
});

app.delete('/bookmark/:id', (req, res) => {
  const { id } = req.params;
  const index = bookmarks.findIndex((bookmark) => bookmark.id === id);
  if(index < 0) {
    return notFoundErrorMessage(res, 'id');
  }
  bookmarks.splice(index, 1);
  return res.status(200).end();
});

app.patch('/bookmark/:id', (req, res) => {
  const { query, params } = req;
  const { id } = query;
  if(!id) {
    return parameterMissingError(res, 'ID');
  }
  const idParams = params.id;
  if(id !== idParams) {
    return errorMessage(res, 'Path id and body id are not the same', 409);
  }
  const index = bookmarks.findIndex((bookmark) => bookmark.id === id);
  if(index < 0) {
    return notFoundErrorMessage(res, 'id');
  }
  const bookmark = bookmarks[index];
  ['title', 'description', 'url', 'rating'].forEach((field) => {
    bookmark[field] = query[field] || bookmark[field];
  })
  bookmarks[index] = bookmark;
  return res.status(202).json(bookmark);
});

app.listen(8080, () => {
  console.log("This server is running on port 8080");
});
