const translator = require("../translator");
const utils = require("../utility/utils");
const redisUtility = require('../redis/redis-utility');

const getBookDetail = "gBD";
const downloadBooksParts = "dBP";
const moreBookTitle = "mbt";
const moreBookDetails = "mbd";
const moreBookCategory = "mbc";


const buildInLineKeyboardToShowBookParts = async (book) => {
  const inlineKeyboardArray = [];
  for (let i = 0; i < book.parts.length; i++) {
    const part = book.parts[i]
    const randomString = utils.getRandomString(10);
    console.log({book: book, partName: part.partName, randomString})

    await redisUtility.setInRedisWithExpiration(randomString, {book, partName: part.partName});
    const callback_data = {
      type: downloadBooksParts,
      link: randomString
    };
    const KeyboardRow = [];
    KeyboardRow.push({text: part.partName, callback_data: JSON.stringify(callback_data)});
    inlineKeyboardArray.push(KeyboardRow);


  }
  const keyboardStr = JSON.stringify({
    inline_keyboard: inlineKeyboardArray
  });
  console.log({
    parse_mode: "Markdown",
    reply_markup: JSON.parse(keyboardStr),
    disable_web_page_preview: true
  })
  return {
    parse_mode: "Markdown",
    reply_markup: JSON.parse(keyboardStr),
    disable_web_page_preview: true
  };
};


const createKeyboardForEachBook = (bookList, inlineKeyboardArray, callback_data) => {
  bookList.forEach(book => {
    callback_data = {
      type: getBookDetail,
      id: book._id
    };
    const keyBoardRow = [];
    keyBoardRow.push({
      text: book.title + " - " + book.author,
      callback_data: JSON.stringify(callback_data)
    });
    inlineKeyboardArray.push(keyBoardRow)
  });
};


const moreThanTenBookHandler = (searchType, type, callback_data, bookList, inlineKeyboardArray, begin) => {
  const keyBoardRow = [];
  switch (searchType) {
    case "category":
      type = moreBookCategory;
      callback_data = {
        type,
        category: bookList[0].category,
        begin
      };
      break;

    case "details":
      type = moreBookDetails;
      callback_data = {
        type,
        category: bookList[0].details,
        begin
      };
      break
  }
  keyBoardRow.push({text: translator.translate("MORE_OPTIONS"), callback_data: JSON.stringify(callback_data)});
  inlineKeyboardArray.push(keyBoardRow)
};


const buildInLineKeyboardToShowSearchedBook = (booksData, searchType, begin = 0) => {
  const inlineKeyboardArray = [];
  const type = "";
  let callback_data;
  const bookList = booksData.result;
  if (bookList && bookList.length > 0) {
    createKeyboardForEachBook(bookList, inlineKeyboardArray, callback_data);
  }
console.log("booklist.length>>>",bookList.length)
  if (bookList.length >= 10  ) {
    // callback_data = {
    //   "type": "mbd",
    //   "category": bookList.details,
    //   "begin": bookList.begin
    // }
    console.log("more book...")
    moreThanTenBookHandler(searchType, type, callback_data, bookList, inlineKeyboardArray, begin)
  }
  const keyboardStr = JSON.stringify({
    inline_keyboard: inlineKeyboardArray
  });
  return {parse_mode: "Markdown", reply_markup: JSON.parse(keyboardStr)};
};


module.exports = {buildInLineKeyboardToShowBookParts, buildInLineKeyboardToShowSearchedBook};