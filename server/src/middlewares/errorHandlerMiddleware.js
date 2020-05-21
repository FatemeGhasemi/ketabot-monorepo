const errorHandlerMiddleware = async (err, req, res, next)=>{
  res.status(err.status || 500).json({
    errorCode:err.errorCode || "INTERNAL_SERVER_ERROR",
    description:err.description,
    error:err.error
  })
}

module.exports = {errorHandlerMiddleware}