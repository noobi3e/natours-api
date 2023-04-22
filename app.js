const bodyParser = require('body-parser')
const express = require('express')
const UserRoutes = require('./routes/userRoutes')
const TourRoutes = require('./routes/tourRoutes')
const AppError = require('./utils/AppError')

const app = express()

app.use(bodyParser.json())

app.use('/api/v1/users', UserRoutes)
app.use('/api/v1/tours', TourRoutes)

// Handling Unhandled routes
app.use((req, _, next) => {
  // creating an error which will get handled by error middleware we defined below
  // const errObj = new Error(`😔API doesn't have data for this ${req.url} route.`)
  // errObj.statusCode = 404
  // errObj.status = 'Fail⚠️'
  // using a error utility class to create an error

  const errObj = new AppError(
    `😔API doesn't have data for this ${req.url} route.`,
    404
  )

  // now in order to pass this error to the error middleware by passing this error object in next() function by doing this express will assume an error ocurred and pass that obj to the error middleware as first argument.
  // BRIEF whenever in any middleware if we pass some thing in next() function then express will skip all middleware and directly jumps to the error middleware.
  next(errObj)
})

// as of know we are handling operational errors like data not found in database or mongoose error return by DATA-VALIDATORS in the catch block of controller but in express we can create an another middleware function for handling error and just pass on error from controllers and express will take care of that.

// in express if we create a middleware with parameter express will automatically knows that thats a error handling middleware EX:
// CREATING ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  // setting default statusCode
  err.statusCode = err.statusCode || 500 // default 500 internal server error

  // setting default status
  err.status = err.status || 'Error💥' // error default if internal server error occured

  res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
  })
})

module.exports = app
