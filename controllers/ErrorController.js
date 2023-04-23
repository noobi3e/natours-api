// in express if we create a middleware with 4 parameter express will automatically knows that thats a error handling middleware EX:

const AppError = require('../utils/AppError')

// CREATING ERROR HANDLING MIDDLEWARE
exports.errorController = (err, req, res, next) => {
  // setting default statusCode
  err.statusCode = err.statusCode || 500 // default 500 internal server error

  // setting default status
  err.status = err.status || 'Error💥' // error default if internal server error occured

  // Diving error for development and production
  // we will send simple error in production so that user can't be shown lengthy as well important error that might occur
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      err,
    })
  }
  // SENDING Simple understandable error message to client once we deploy our app
  else if (process.env.NODE_ENV === 'production') {
    let modifiedError = err
    // Handling Mongoose some mongoose error which we want to simply for end user insteading of sending generic 500 error
    // handling error for user request for IN-VALID IDS
    if (err.name === 'CastError') {
      modifiedError = new AppError(`Invalid ${err.path}: ${err.value}`, 404)
    }

    // handling Duplicate fields error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0]
      const fieldValue = Object.values(err.keyValue)[0]
      modifiedError = new AppError(
        `Duplicate Field value ${field}: ${fieldValue}, Try another value.`,
        404
      )
    }

    // Handling Mongoose validation error
    if (err.name === 'ValidationError') {
      modifiedError = new AppError(err.message, 404)
    }

    if (modifiedError.isOperational) {
      res.status(modifiedError.statusCode).json({
        status: modifiedError.status,
        statusCode: modifiedError.statusCode,
        message: modifiedError.message,
      })
    }
    // SENDING Generic error we didn't handled errors by ourself or error is not operational.
    else {
      console.error(err) // for ourSelf
      res.status(500).json({
        status: 'Error💥',
        statusCode: 500,
        message: '❌Something went wrong',
      })
    }
  }
}
