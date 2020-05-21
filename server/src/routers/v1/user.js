const express = require('express');
const userAdapter = require("../../repositories/user");
const router = express.Router();
const checkAdminRole = require('../../middlewares/check-roles')
const responseHandler = require("../../utility/responseHandler")


const createNewUser = async (req, res,next) => {
  try {

    const {
      downloadCount,
      telegramId,
      lastName,
      firstName,
      username
    } = req.body

    if (!telegramId) {
      throw  responseHandler.createStandardError({
        error: new Error(),
        errorCode: "TELEGRAM_ID_IS_REQUIRED",
        status: 400
      })
    }
    const result = await userAdapter.createUser({
      downloadCount,
      telegramId,
      lastName,
      firstName,
      username
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


const getListOfUsers = async (req, res,next) => {
  try {
    const result = await userAdapter.listUsers();
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



const increaseDownloadCount = async (req,res,next)=>{
  try {


    const result = await userAdapter.updateDownloadCount(req.params.telegramId)

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





router.post('/', createNewUser);
router.get('/', checkAdminRole.checkAdmin, getListOfUsers);
router.put('/:telegramId/increaseDownloadCount',increaseDownloadCount)
module.exports = router;

