const mongoose = require('mongoose');
let mongoUrl = "mongodb://"

if (process.env.MONGO_USERNAME) {
  mongoUrl += process.env.MONGO_USERNAME + ":" + process.env.MONGO_PASSWORD + "@" + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DB_NAME;
} else {
  mongoUrl += process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DB_NAME;
  console.log("mongoUrl>>>>>>>>>>>",mongoUrl)
}
const initMongo = () => {
  console.log("mongoUrl:", mongoUrl);
  mongoose.connect(mongoUrl, {useNewUrlParser: true});
  const db = mongoose.connection;
  db.on('error',
    (e) => {
      console.log('db connection error...', e)
      throw e
    });
  db.once('open', () => {
    console.log('db opened...');
  });
};

module.exports = {initMongo}