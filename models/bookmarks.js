const mongoose = require('mongoose');

const bookmarksSchema = mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
});

const bookmarksCollection = mongoose.model('bookmarks', bookmarksSchema);

const Bookmarks = {
  createBookmark: async (bookmark) => {
    try {
      return await bookmarksCollection.create(bookmark);
    } catch (error) {
      throw new Error(error);
    }
  }, getAllBookmarks: async () => {
    try {
      return await bookmarksCollection.find();
    } catch (error) {
      throw new Error(error);
    }
  }, getBookmarksByTitle: async (title) => {
    try {
      return await bookmarksCollection.find({ title });
    } catch (error) {
      throw new Error(error);
    }
  }, deleteBookmark: async (id) => {
    try {
      return await bookmarksCollection.findOneAndDelete({ id });
    } catch (error) {
      throw new Error(error);
    }
  }, updateBookmark: async (id, toUpdate) => {
    try {
      return await bookmarksCollection.findOneAndUpdate(
        { id }, toUpdate, { new: true }
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = { Bookmarks }
