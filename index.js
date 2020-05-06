const authorization = require('./middleware/authorization');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const uuid = require('uuid');
const { Bookmarks } = require('./models/bookmarks')

const app = express();
const jsonParser = bodyParser.json();
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(authorization);

function createBookmark({ title, description, url, rating }) {
  return {
    id: uuid.v4(),
    title,
    description,
    url,
    rating
  };
}

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

function databaseError(res, error) {
  return errorMessage(res, `Something is wrong with the database: ${error}`, 500)
}

app.get('/bookmarks', async (_, res) => {
  try {
    const result = await Bookmarks.getAllBookmarks();
    return res.status(200).json(result);
  } catch (err) {
    return databaseError(res, err);
  }
});

app.get('/bookmark', async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return parameterMissingError(res, 'Title');
  }
  try {
    const bookmarksAnswer = await Bookmarks.getBookmarksByTitle(title);
    if (bookmarksAnswer.length === 0) {
      return notFoundErrorMessage(res, 'title');
    }
    return res.status(200).json(bookmarksAnswer);
  } catch (err) {
    return databaseError(res, err);
  }
});

app.post('/bookmarks', jsonParser, async (req, res) => {
  const fields = ['title', 'description', 'url', 'rating'];
  const { body } = req;
  for (let i = 0; i < 4; i++) {
    const searchedField = fields[i];
    if (!Object.prototype.hasOwnProperty.call(body, searchedField)) {
      return parameterMissingError(res, searchedField);
    }
  }
  const bookmark = createBookmark(body);
  try {
    const result = await Bookmarks.createBookmark(bookmark);
    return res.status(201).json(result);
  } catch (err) {
    return databaseError(res, err);
  }
});

app.delete('/bookmark/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Bookmarks.deleteBookmark(id);
    if(result == null) {
      return notFoundErrorMessage(res, 'id')
    }
    return res.status(200).end();
  } catch (err) {
    return databaseError(res, err);
  }
});

app.patch('/bookmark/:id', jsonParser, async (req, res) => {
  const { body, params } = req;
  const { id, ...toUpdate } = body;
  if (!id) {
    return parameterMissingError(res, 'ID');
  }
  const idParams = params.id;
  if (id !== idParams) {
    return errorMessage(res, 'Params id and body id are not the same', 409);
  }
  try {
    const result = await Bookmarks.updateBookmark(id, toUpdate);
    return res.status(202).json(result);
  } catch (err) {
    return databaseError(res, err);
  }
});

app.listen(8080, () => {
  console.log("This server is running on port 8080");
  new Promise(( resolve, reject ) => {
    const settings = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    };
    mongoose.connect('mongodb://localhost/bookmarksdb', settings, ( err ) => {
      if( err ){
        return reject( err );
      }
      else{
        console.log( "Database connected successfully." );
        return resolve();
      }
    });
  }).catch(err => {
    console.log( err );
  });
});
