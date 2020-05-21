const userSchema = require('../models/user').userModel;


const updateDownloadCount = async (telegramId) => {
  let downloadCount = await getDownloadCount(telegramId)
  downloadCount++;
  return userSchema.findOneAndUpdate(
    {telegramId},
    {downloadCount}
    , {new: true}
    )
};


const getDownloadCount = async (telegramId) => {
  return userSchema.findOne(
    {telegramId: telegramId}, {downloadCount: 1}
  );
};


const createUser = async ({ downloadCount,
                            telegramId,
                            lastName,
                            firstName,
                            username}) => {

  return userSchema.findOneAndUpdate(
    {
      telegramId
    },
    {downloadCount,
      telegramId,
      lastName,
      firstName,
      username},
    {upsert: true}
  )

};


const listUsers = async () => {
  return userSchema.find({})
};

module.exports = {
  updateDownloadCount,
  createUser,
  listUsers
};