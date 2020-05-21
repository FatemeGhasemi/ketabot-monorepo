const createStandardError = ({error, errorCode, status, description}) => {
  console.log('createStandardError called', {errorCode, status, error, description})
  if (!error) {
    error = new Error()
  }
  if (error.errorParsed) {
    return error;
  }
  error.errorCode = errorCode;
  error.description = description || error.message;
  error.status = status;
  error.errorParsed = true
  return error
};

const sendStandardResponse = (req, res, data) => {
  const {result, description} = data
  return res.json({result, description})
}

const sendStandardError = (req, res, {result, status, description}) => {
  throw res.status(status).json({result, status, description})
}

module.exports = {sendStandardError, sendStandardResponse, createStandardError}