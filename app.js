const bodyParser = require('body-parser')
const express = require('express')
const UserRoutes = require('./routes/userRoutes')
const TourRoutes = require('./routes/tourRoutes')
const AppError = require('./utils/AppError')
const { errorController } = require('./controllers/ErrorController')

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

  // now in order to pass this error to the error middleware by passing this error object in next() function by doing this express will assume an error ocurred and pass that obj to the error middleware as first argument.
  // BRIEF whenever in any middleware if we pass some thing in next() function then express will skip all middleware and directly jumps to the error middleware.
  // using a error utility class to create an error
  next(new AppError(`😔API doesn't have data for this ${req.url} route.`, 404))
})

// as of know we are handling operational errors like data not found in database or mongoose error return by DATA-VALIDATORS in the catch block of controller but in express we can create an another middleware function for handling error and just pass on error from controllers and express will take care of that.

app.use(errorController)

module.exports = app
