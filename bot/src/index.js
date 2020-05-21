require('dotenv').config();
const Sentry = require('@sentry/node');
const TelegramBot = require('node-telegram-bot-api');
let bot;
if (process.env.NODE_ENV === 'production') {
  setWebHook();
  Sentry.init({dsn: process.env.HEROCU_DSN});
} else {
  console.log("BOT_TOKEN: ", process.env.BOT_TOKEN)
  bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
  Sentry.init({dsn: process.env.LOCAL_DSN})
}

const redisUtility = require('./redis/redis-utility');
const utils = require("./utility/utils");
const translator = require("./translator");
const userRequests = require('./service/user');
const bookRequest = require('./service/book');
const telegramBotWrapper = require('./wrapper/telegram-bot');

const categoriesArray = [translator.translate("STORY"), translator.translate("FOREIGN"),
  translator.translate("SHORT_STORY"), translator.translate("POEM")];

const getBookDetail = "gBD";
const downloadBooksParts = "dBP";
const moreBookTitle = "mbt";
const moreBookDetails = "mbd";
const moreBookCategory = "mbc";


function setWebHook() {
  const options = {
    webHook: {
      port: process.env.PORT
    }
  };
  bot = new TelegramBot(process.env.BOT_TOKEN, options);
  /**
   * For setting webHook in heroku apps , see below link
   * {@link https://github.com/yagop/node-telegram-bot-api/blob/master/examples/webhook/heroku.js GitHub}.
   */
  const webHookUrl = `${process.env.HEROKU_URL}/bot${process.env.BOT_TOKEN}`
  bot.setWebHook(webHookUrl).then(console.log("webHook has been set for bot"));
}

const showMainMenu = async (msg, text) => {
  await bot.sendMessage(msg.from.id, text, {
    "reply_markup": JSON.stringify({
      "keyboard": [
        [translator.translate("SEARCH")],
        [translator.translate("STORY")],
        [translator.translate("FOREIGN")],
        [translator.translate("SHORT_STORY")],
        [translator.translate("POEM")]
      ]
    })
  })
};


bot.getMe().then(function (me) {
  console.log("Hi I am %s !", me.username);
});


const handleStartCommand = async (msg) => {
  try {
    await userRequests.createUser(msg.from);
    await showMainMenu(msg, translator.translate("CHOOSE_YOUR_WANTED_BOOK_CATEGORY_OR_SEARCH_IT"))
  } catch (e) {
    console.log('handleStartCommand error ', e)
  }
};

const handleDeepLink = async (msg) => {
  try {
    const bookId = utils.findBookIdFromText(msg.text);
    const foundBookData = await bookRequest.findBookById(bookId);

    if (!foundBookData || foundBookData.result.length === 0) {
      await showMainMenu(msg, translator.translate("THERE_IS_NO_SUCH_A_BOOK"));
    }
    const inLineKeyboard = await telegramBotWrapper.buildInLineKeyboardToShowBookParts(foundBookData.result);
    await userRequests.createUser(msg.from);
    const message = createMessageForBookThatChosen(foundBookData.result)

    await bot.sendMessage(msg.from.id, message, inLineKeyboard)
  } catch (e) {
    console.log("handle deep link error :", e.message)
  }
};

const handleCategoryMessage = async (msg) => {
  try {
    const eng_msg = translator.convertPersianCategoryToEnglish(msg.text);
    const foundBookData = await bookRequest.findBookByCategory(eng_msg);
    console.log("foundBookData in handleCategoryMessage>>>>> ",{result:foundBookData.result,length:foundBookData.result.length})
    if (!foundBookData || foundBookData.length) {
      await showMainMenu(msg, translator.translate("THERE_IS_NO_SUCH_A_BOOK"));
    }
    const keyboard = telegramBotWrapper.buildInLineKeyboardToShowSearchedBook(foundBookData, "category");
    await bot.sendMessage(msg.from.id, translator.translate("FOUND_BOOK_LIST"), keyboard)
  } catch (e) {
    console.log("handle CategoryMessage error :", e.message)

  }
};

const handleDetailsMessage = async (msg) => {
  try {
    const eng_msg = translator.convertPersianCategoryToEnglish(msg.text);
    await redisUtility.setInRedisWithExpiration(msg.from.id, msg.text, 900)
    const foundBookData = await bookRequest.findBookByDetails(eng_msg);
    const x = await bookRequest.findBookByDetails(eng_msg, 0, 100);
    const bookList = foundBookData.result;
    if (!bookList || bookList.length === 0) {
      await showMainMenu(msg, translator.translate("THERE_IS_NO_SUCH_A_BOOK"));
    }
    const keyboard = telegramBotWrapper.buildInLineKeyboardToShowSearchedBook(foundBookData, "details");
    await bot.sendMessage(msg.from.id, translator.translate("FOUND_BOOK_LIST"), keyboard)
  } catch (e) {
    console.log("handleDetailsMessage err:", e.message)
  }
};


const messageHandler = async (msg) => {
  await userRequests.createUser(msg.from);
  if (msg.text.includes("start id-")) {
    await handleDeepLink(msg);
  } else if (msg.text === "/start" || msg.text === "start") {
    await handleStartCommand(msg);
  } else if (!categoriesArray.includes(msg.text) && (msg.text !== "/start" || msg.text !== "start")) {
    await handleDetailsMessage(msg);
  } else if (categoriesArray.includes(msg.text)) {
    await handleCategoryMessage(msg);
  } else if (msg.text === translator.translate("SEARCH")) {
    bot.sendMessage(msg.from.id, translator.translate("SEARCH_YOUR_WANTED_BOOK")).then(console.log("msg.text", msg.text));
  }
};


bot.on("message", async (msg) => {
  console.log("message>>>>>>", msg)
  await messageHandler(msg)
});


const sendAudio = async (partData, msg) => {
  try {
    // userRequests.increaseDownloadCount(msg.from);
    const book = partData.book;
    const bookTitle = book.title.split(" ").join("_");
    let author = book.author;
    if (author && author !== "") {
      author = book.author.split(' ').join('_');
    }
    const partTitle = partData.partName;
    const downloadLink = utils.generateDownloadLink(book.path, partTitle);
    await bot.sendChatAction(msg.from.id, "upload_audio");
    await bot.sendAudio(msg.from.id, downloadLink
      , {
        title: partTitle,
        performer: bookTitle,
        caption: "\n\n" + "#" + author + "\n\n " + process.env.CHAT_ID
      });
  } catch (e) {
    console.log("sendAudio ERROR: ", e.message)
  }
};


const handleGetBookDetailsCallbackQuery = async (msg, callback_data) => {
  const bookId = callback_data.id;
  const foundBookData = await bookRequest.findBookById(bookId);
  const book = foundBookData.result
  const msgFinalText = createMessageForBookThatChosen(book)
  const inLineKeyboard = await telegramBotWrapper.buildInLineKeyboardToShowBookParts(book);
  await userRequests.createUser(msg.from);
  await bot.sendMessage(msg.from.id, msgFinalText, inLineKeyboard);
};


const createMessageForBookThatChosen = (book) => {
  let author = book.author;
  const description = book.description;
  const title = book.title.split(" ").join("_");
  let msgFinalText = "#" + title +"\n\n"
  if (author && author !== "") {
    author = author.split(' ').join('_');
    msgFinalText += "\n" + "#" + author + "\n\n"
  }
  if (description && description !== "") {
    msgFinalText += "\n" + description + "\n\n"
  }
  msgFinalText += translator.translate("SHARE_BY_THIS_LINK_MESSAGE") + " \n\n " + process.env.CHAT_ID + "\n\n" + utils.deepLinkGenerator(book._id);
  return msgFinalText
}


const handleDownloadBookParts = async (msg, callback_data) => {
  const randomString = callback_data.link;
  const partData = await redisUtility.getFromRedis(randomString);
  await sendAudio(partData, msg);
  // userRequests.increaseDownloadCount({
  //   "telegramId": msg.from.id
  // });
};


const handleMoreBook = async (msg, callback_data) => {
  try {
    let foundBookData;
    let keyboard;

    if (callback_data.type === moreBookCategory) {
      foundBookData = await bookRequest.findBookByCategory(callback_data.category, callback_data.begin + 10, 10);
      keyboard = telegramBotWrapper.buildInLineKeyboardToShowSearchedBook(foundBookData, "category", callback_data.begin + 10);

    }

    if (callback_data.type === moreBookDetails) {
      const details = await redisUtility.getFromRedis(msg.from.id)
      console.log("handleMoreBookDetail begin total>>>>>>>>", {
        begin: callback_data.begin,
        total: 10,
        category: details,
        type: callback_data.type,
      })

      foundBookData = await bookRequest.findBookByDetails(details, callback_data.begin + 10, 10);
      keyboard = telegramBotWrapper.buildInLineKeyboardToShowSearchedBook(foundBookData, "details", callback_data.begin + 10);

    }
    let bookList = foundBookData.result;

    if (bookList && bookList.length > 0) {
      bookList = bookList.reverse();
    }
    if (!bookList || bookList.length === 0) {
      await showMainMenu(msg, translator.translate("THERE_IS_NO_SUCH_A_BOOK"));
      return;
    }
    await bot.sendMessage(msg.from.id, translator.translate("FOUND_BOOK_LIST"), keyboard);
  } catch (e) {
    console.log("handleMoreBookCategory ERROR:", e.message)
  }
};


const handleCallbackDataCases = async (msg, callback_data) => {
  try {
    switch (callback_data.type) {
      case getBookDetail:
        await handleGetBookDetailsCallbackQuery(msg, callback_data);
        break;

      case downloadBooksParts:
        await handleDownloadBookParts(msg, callback_data);
        break;

      case moreBookCategory:
        await handleMoreBook(msg, callback_data);
        break;

      case moreBookDetails:
        await handleMoreBook(msg, callback_data)
        break;
    }
  } catch (e) {
    console.log(" handleCallbackDataCases err:", e.message)
  }
};


bot.on("callback_query", async (msg) => {
  try {
    await bot.answerCallbackQuery(msg.id, "", false);
    const callback_data = JSON.parse(msg.data);
    await handleCallbackDataCases(msg, callback_data)
  } catch (e) {
    console.log("callback_query event ERROR: ", e.message)
  }
});
