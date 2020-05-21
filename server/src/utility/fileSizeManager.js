// const bookRepository = require("../repositories/book")
// const request = require("request");
// const bookSchema = require('../models/book').bookModel;
//
// const mongoose = require('mongoose');
// let mongoUrl = "mongodb://"
//
//   mongoUrl += "fagha" + ":" + "Aa09360475919" + "@" + "ds119685.mlab.com" + ":" + "19685" + "/" + "testi";
// const initMongo = () => {
//   console.log("mongoUrl:", mongoUrl);
//   mongoose.connect(mongoUrl, {useNewUrlParser: true});
//   const db = mongoose.connection;
//   db.on('error',
//     (e) => {
//       console.log('db connection error...', e)
//       throw e
//     });
//   db.once('open', () => {
//     console.log('db opened...');
//     // eslint-disable-next-line no-console
//     console.error('db opened ...');
//   });
// };
// initMongo()
//
//
//
//
//
//
//
//
// const getfileSizeByUrl = async (url) => {
//   console.log("hii getfileSizeByUrl")
//   const fileSize = await request({
//     url,
//     method: "HEAD"
//   });
//   console.log("get file size by url--->", {size: fileSize['content-length'], all: fileSize})
//   return fileSize['content-length']
//
// }
//
// const checkFileSizeNotBiggerThanWanted = (sizeWantToCheckNotBiggerThanThisInMb, sizeInContentLength) => {
//   const sizeWantToCheckNotBiggerThanThisInContentLength = sizeWantToCheckNotBiggerThanThisInMb * 1024 * 1024;
//   console.log("hii checkFileSizeNotBiggerThanWanted: ", (sizeInContentLength > sizeWantToCheckNotBiggerThanThisInContentLength))
//
//   return (sizeInContentLength > sizeWantToCheckNotBiggerThanThisInContentLength)
//
// }
//
// const allFileSizeCheker = async () => {
//   console.log("hii allFileSizeCheker")
//   const allBooks = await bookSchema.find().sort({title: -1}).skip(0).limit(10000)
//
//   console.log("allBooks--->", allBooks)
//
//   const promis = []
//
//   for (let i = 0; i < allBooks.length; i++) {
//     const book = allBooks[i]
//     console.log("book--->", book)
//     const parts = book.parts
//     console.log("parts--->", parts)
//
//     for (let j = 0; j < parts.length; j++) {
//       const part = parts[j]
//       console.log("part--->", part)
//       if(part.sourceDownloadLink) {
//         const partContentLength = await getfileSizeByUrl(part.sourceDownloadLink)
//         if (checkFileSizeNotBiggerThanWanted(50, partContentLength)) {
//           const result = bookRepository.updateBookData({isActive: false}, book._id)
//           promis.push(result)
//         }
//       }
//
//     }
//
//   }
//   return Promise.all(promis).then(function (values) {
//     console.log("values", values);
//   });
//
// }
//
//
// allFileSizeCheker().then(res => {
//   console.log("res>>>", res)
// }).catch(err=>{
//   console.log("err>>",err)
// })