const express = require("express");
const book = require("../../repositories/book");
const router = express.Router();
const checkAdminRole = require("../../middlewares/check-roles");
const responseHandler = require("../../utility/responseHandler")


const addNewBook = async (req, res, next) => {
  try {
    const {
      tags,
      parts,
      isActive,
      title,
      category,
      author,
      cost,
      path
    }
      = req.body
    const result = await book.createBook({
      tags,
      parts,
      isActive,
      title,
      category,
      author,
      cost,
      path
    });
    return responseHandler.sendStandardResponse(req, res, {result})
  } catch (e) {
    next(responseHandler.createStandardError({
        error: e,
        errorCode: "INTERNAL_SERVER_ERROR",
        status: 500,
      }
      )
    )
  }
};


const updateBook = async (req, res, next) => {
  try {
    const book = await book.findBookById(req.params.bookId)
    if (!book) {
      throw responseHandler.sendStandardError(req, res, {result: "BOOK_NOT_FOUND", status: 404})
    }
    const result = await book.updateBookData(req.body, req.params.bookId);
    return responseHandler.sendStandardResponse(req, res, {result})

  } catch (e) {
    next(responseHandler.createStandardError({
        error: e,
        errorCode: "INTERNAL_SERVER_ERROR",
        status: 500,
      }
      )
    )
  }
};


const searchBookByCategory = async (req, res, next) => {
  try {
    console.log("req.query",req.query)
    const beginNum = parseInt(req.query.begin) || 0;
    const totalNum = parseInt(req.query.total) || 11;
    const category = req.query.category;
    const result = await book.findBookByCategory(category, beginNum, totalNum);
    console.log("result search by category>>>",{result,length:result.length})
    return responseHandler.sendStandardResponse(req, res, {result})

  } catch (e) {
    next(responseHandler.createStandardError({
        error: e,
        errorCode: "INTERNAL_SERVER_ERROR",
        status: 500,
      }
      )
    )
  }
};


const searchBookById = async (req, res, next) => {
  try {
    const result = await book.findBookById(req.query.bookId);
    return responseHandler.sendStandardResponse(req, res, {result})

  } catch (e) {
    next(responseHandler.createStandardError({
        error: e,
        errorCode: "INTERNAL_SERVER_ERROR",
        status: 500,
      }
      )
    )
  }
};

const searchBookByTitle = async (req, res, next) => {
  try {
    const result = await book.findBookByTitle(req.query.title);
    return responseHandler.sendStandardResponse(req, res, {result})
  } catch (e) {
    next(responseHandler.createStandardError({
        error: e,
        errorCode: "INTERNAL_SERVER_ERROR",
        status: 500,
      }
      )
    )
  }
};


const searchBookByDetails = async (req, res, next) => {
  try {
    const beginNum = parseInt(req.query.begin) || 0;
    const totalNum = parseInt(req.query.total) || 10;
    const details = req.query.details;
    const result = await book.searchBookByDetails(details, beginNum, totalNum);
    return responseHandler.sendStandardResponse(req, res, {result})
  } catch (e) {
    next(responseHandler.createStandardError({
        error: e,
        errorCode: "INTERNAL_SERVER_ERROR",
        status: 500,
      }
      )
    )
  }
};


const returnAllBooks = async (req, res, next) => {
  try {
    const beginNum = parseInt(req.query.begin) || 0;
    const totalNum = parseInt(req.query.total) || 10;
    const result = await book.returnAllBooks(beginNum, totalNum);
    return responseHandler.sendStandardResponse(req, res, {result})
  } catch (e) {
    next(responseHandler.createStandardError({
        error: e,
        errorCode: "INTERNAL_SERVER_ERROR",
        status: 500,
      }
      )
    )
  }

}


const searchBookController = async (req, res, next) => {
  try {
    console.log("req.query in searchBookController>>>",req.query)
    if (req.query.bookId) {
      await searchBookById(req, res, next)
    }
    else if (req.query.category) {
      await searchBookByCategory(req, res, next)
    }
    else if (req.query.details) {
      await searchBookByDetails(req, res, next);
    }
    else if (req.query.title) {
      await searchBookByTitle(req, res, next)
    }
    else if (!req.query || req.query.begin || req.query.total) {
      await returnAllBooks(req, res, next)
    }
    else {
      throw  responseHandler.createStandardError({
        error: new Error(),
        errorCode: "THIS_QUERY_STRING_IS_NOT_VALID",
        status: 400
      })
    }

  } catch (e) {
    next(responseHandler.createStandardError({
        error: e,
        errorCode: "INTERNAL_SERVER_ERROR",
        status: 500,
      }
      )
    )
  }
};


router.post('/', checkAdminRole.checkAdmin, addNewBook);
router.put('/:bookId', checkAdminRole.checkAdmin, updateBook);
router.get('/', searchBookController);
module.exports = router;