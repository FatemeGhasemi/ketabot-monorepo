const redis = require("redis");

//TODO change redis library to 'handy-redis' that natively support promises
let redisClient;

console.log("redis info ",{
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  name: process.env.REDIS_DB,
  password: process.env.REDIS_PASSWORD
})


const getRedisClient = () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      name: process.env.REDIS_DB,
      password: process.env.REDIS_PASSWORD
    });
  }
  return redisClient
};


const getFromRedis = (key) => {
  return new Promise((resolve, reject) => {
    getRedisClient().get(key, function (err, result) {
      if (err) {
        return reject(err)
      }
      console.log('----------Redis : ', JSON.parse(result))
      resolve(JSON.parse(result))
    })
  })
};

const setInRedisWithExpiration = (key, data, expirationSecond=18000) => {
  try {
    return new Promise((resolve, reject) => {
      getRedisClient().set(key, JSON.stringify(data), 'EX', expirationSecond, function (err, result) {
        if (err) {
          console.log("setInRedisWithExpiration error ", err)

          return reject(err)
        }
        resolve(result)
      })
    })
  } catch (e) {
    console.log("setInRedisWithExpiration err: ", e)
    throw e
  }
};

module.exports = {
  setInRedisWithExpiration,
  getFromRedis

};
