const bookSchema = require('../models/book').bookModel;
const utils = require("../utility/utils")
const ObjectId = require('mongoose').Types.ObjectId

const createBook = async ({
                            tags,
                            parts,
                            isActive,
                            title,
                            category,
                            author,
                            cost,
                            path
                          }) => {

  return bookSchema.findOneAndUpdate(
    {
      title
    },
    {
      tags,
      parts,
      isActive,
      title,
      category,
      author,
      cost,
      path
    },
    {upsert: true}
  )


}

const findBookByCategory = async (category, begin, total) => {
  return bookSchema.find({category: category}).sort({title: -1}).skip(begin).limit(total)
};


const searchBookByDetails = async (details, begin, total) => {
  return bookSchema.find({$text: {$search: details}}).sort({title: -1}).skip(begin).limit(total)
};


const returnAllBooks = async (begin = 0, total = 10) => {
  return bookSchema.find().sort({title: -1}).skip(begin).limit(total)
};


const findBookByTitle = async (details, begin, total) => {
  return bookSchema.find({$text: {$search: details}}).sort({title: -1}).skip(begin).limit(total)
};


const findBookById = async (bookId) => {
  return bookSchema.findOne({_id: new ObjectId(bookId)})
};

const updateBookData = async (data, id) => {
  const {
    author, publisher,
    description, cost,
    bookName, title,
    translator, category,
    publishedYear, voiceActor,
    sourceLink, parts,
    cover, type,
    language, tags,
  } = data

  utils.removeUndefinedFieldsFromObject(data, id)
  return bookSchema.findOneAndUpdate({_id: new ObjectId(id)}, {
    author, publisher,
    description, cost,
    bookName, title,
    translator, category,
    publishedYear, voiceActor,
    sourceLink, parts
    , type, language,
    tags, cover
  }, {new: true})
};

module.exports = {
  findBookByTitle,
  findBookByCategory,
  createBook,
  findBookById,
  searchBookByDetails,
  updateBookData,
  returnAllBooks
};