const express = require('express')
const TourController = require('../controllers/tourContoller')

const router = express.Router()

// we can pass multiple middleware functions (also known as chaining middlewares) in one route handler as done below in post() method handler
// this comes in handy for ex: if we want to check the req.body for data submit by user is valid or not.
// and to limit certain logic to certain middleware like we should store only creating tour logic in createTour() middleware function

// adding a top-5-cheap route alias which return 5 best and cheap tours for this user can build its own query and passed as query paramter but we can create a separate route for that in which we add a middleware which will set all the filters requires then we call the getAllTours() to send back the data
router.route('/top-5-tours').get((req, _, next) => {
  req.query.sort = '-ratingsAverage%price'
  req.query.limit = '5'
  req.query.fields = 'name%duration%summary%price%ratingsAverage'

  next()
}, TourController.getAllTours)

// testing aggregation pipeline
router.route('/top-tour-stats').get(TourController.getTourStats)

// testing more aggregation pipline stages
router.route('/monthly-plan/:year').get(TourController.getMonthlyPlan)

// Get all tours and post new tour
router
  .route('/')
  .get(TourController.getAllTours)
  .post(TourController.createTour)

// get / update / delete tour
router
  .route('/:id')
  .get(TourController.getSingleTour)
  .patch(TourController.updateTour)
  .delete(TourController.deleteTour)

module.exports = router
