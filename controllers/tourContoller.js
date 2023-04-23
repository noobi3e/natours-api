// using database
const APIFeatures = require('../utils/ApiFeatures')
const TourModel = require('../models/tourModel')
const AppError = require('../utils/AppError')

// const checkRequestBody = (req, res, next) => {
//   console.log(req.body)

//   if (!req.body.name && !req.body.price) {
//     return res.status(400).json({
//       status: 400,
//       message: "Can't add tour without name and price.",
//     })
//   }

//   next()
// }

const getAllToursWithNotes = async (req, res) => {
  // filtering tours acc to query parameter got from url like: example.com/api/v-1/tours?key=value&anotherykey=value...

  // not not only we can filter by checking exact value instead we can filter for lt, lte, gte, gt value as well just by passing that value like duration[advanceFilter]=value ex: duration[$gte]=4 this will be converted to object look like {duration: {'$gte': 4}} which is a valid filter to pass in find() method | NOTE: we have to pass this special query with $ sign otherwise we have to manually do it in code because mongodb understand these special query if we write those after $ because that is mongoDB specific

  // now through query there can special queries like sort, pageNo, limits, fields to return
  // for these we can filter our query object as shown below: to perform different logic for diff filter
  const filteredQuery = { ...req.query } // creating a copy of query object to not mutate original query object

  // FILTERING SOME SPECIAL QUERY PARAMTERS
  // filtering some special query
  // we are deleting some fields that might be present in query object passed by user, to handle those special query separately.
  const specialFilters = ['sort', 'limit', 'fields', 'page']
  specialFilters.forEach((qr) => delete filteredQuery[qr]) // this delete operator will delete the certain field of object

  // now keep in mind that when we call find() on Model like TourModel that will create a query object if we await that or call then on Model.find() then that will simple return the result (that will be list of documents) but in order to perform advanced filtering like sorting depends on some field or limit the resulted documents, etc, we have to that on query object create by calling .find() method instead of resolving that ex:
  // in mongoose we can filter the find() results as we do in vanilla mongoDB shell

  let queryObj = TourModel.find(filteredQuery)

  // SORTING Functionality
  // now if we get a user request to sort our data acc. to some field we can do that like:
  // checking if we got sort query paramter
  if (req.query.sort) {
    // to sort our documents with more than one sorting criteria mongoose want value as a string separated by space like sort('price duration rating'), for we need to pass more than one value in sort query parameter but spaces is not allowed in urls so we can choose any special character then replace that corrector with space in our code as shown below:

    // adding space if there is more than one sorting criteria
    const sortString = req.query.sort.replaceAll('%', ' ')
    queryObj = queryObj.sort(sortString) // now this will sort the document acc. to sort we got in query string | For ex: if sort=price for this mongoose sort data acc to price in ascending order we want data to be in descending order then we add - in front of value for ex: sort=-price this will sort documents in descending order acc. to price
    // if sort field doesn't exist then that will result in errror
  }
  // adding default sort acc. to createdAt field
  else {
    queryObj = queryObj.sort('createdAt')
  }

  // LIMITING FIELDS
  // limiting field can cause a huge impact on network bandwidth by limiting fields user can request for certain/limited fields.
  // checking if user specifies some fields
  if (req.query.fields) {
    // as same as sorting we can get mulitple field now we first have to convert those field in a string contains fields separated by space
    const fields = req.query.fields.replaceAll('%', ' ')

    queryObj = queryObj.select(fields) // select will return document containing fields we pass as arguments | we can also omit some fields by just adding -sign before field name
  }
  // default value
  else {
    queryObj = queryObj.select('-__v') // removing __v field which mogoose added by default to work properly behind the scenes
  }

  // PAGINATION
  // setting default page and limit values if no values given
  const page = +req.query.page || 1
  const limit = +req.query.limit || 100
  const skip = (page - 1) * limit

  queryObj = queryObj.skip(skip).limit(limit)

  const tours = await queryObj

  if (tours.length === 0) throw new Error('😖No Data found for this request.')

  res.status(200).json({
    status: '✅success',
    statusCode: 200,
    result: tours.length,
    data: {
      tours,
    },
  })
}

const createTour = async (req, res, next) => {
  try {
    const tour = await TourModel.create(req.body)

    res.status(201).json({
      status: '✅success',
      statusCode: 201,
      message: 'Tour Added successfully😀',
      data: {
        tour,
      },
    })
  } catch (err) {
    next(err)
  }
}

// GETTING ALL TOURS
const getAllTours = async (req, res, next) => {
  try {
    const query = new APIFeatures(TourModel.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const tours = await query.mongooseQuery

    if (tours.length === 0)
      throw new AppError('⚠️No Tour found for this request', 404)

    res.status(200).json({
      status: '✅success',
      statusCode: 200,
      result: tours.length,
      data: {
        tours,
      },
    })
  } catch (err) {
    next(err)
  }
}

// DELETING TOUR
const deleteTour = async (req, res) => {
  try {
    await TourModel.findByIdAndDelete(req.params.id)

    res.status(204).json({
      status: '✅success',
      statusCode: 204,
      message: '🗑️Tour deleted successfully',
      data: null,
    })
  } catch (err) {
    next(err)
  }
}

// UPDATING TOUR
const updateTour = async (req, res, next) => {
  try {
    const tour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    console.log(tour)
    if (!tour) throw new AppError(`No Data found for id: ${req.params.id}`, 404)

    res.status(202).json({
      status: '✅success',
      statusCode: 202,
      message: 'Tour Updated successfully😀',
      data: {
        tour,
      },
    })
  } catch (err) {
    next(err)
  }
}

const getSingleTour = async (req, res, next) => {
  try {
    const tour = await TourModel.findById(req.params.id)

    if (!tour) throw new AppError(`No Data found for id: ${req.params.id}`, 404)

    res.status(200).json({
      status: '✅success',
      statusCode: 200,
      data: {
        tour,
      },
    })
  } catch (err) {
    next(err)
  }
}

// MongoDB Aggregation pipeline
const getTourStats = async (req, res, next) => {
  try {
    // aggregate pipline in mongoDB is used to perform more complex filtering and calculations
    // to create aggregate pipeline we use .aggregate() method which wants an array which then contains objects(also known as stages lead by some operators like $match stage)
    // as we know find(), sort(), etc method gives us an query object in same way .aggregate method return a aggreate object | as we know to get the original result we have to await/resolve the object return by these methods

    // ARRAY WE PASS IN AGGREGATE FUNCTION ALSO KNOWN AS AGGREGATION PIPELINE
    const stats = await TourModel.aggregate([
      // THESE OBJECT WHICH ALWAYS START WITH SOME MONGODB OPERATOR ALSO CALLED AS STAGE AND EACH STAGE PERFORM ACTIONS ON RESULTED DOCUMENTS RETURNED BY PREVIOUS STAGE.
      {
        // this $match query will find all the documents that satisfy the condition we pass / also you can think it as a filter we pass in find() method.
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        // this group query will group all the documents together and convert it into one document containing field we specify
        $group: {
          // first we specify id
          _id: '$difficulty', // by defining null group will take all the filtered document filter by $match query and perform action we specify below | but if we want to group our document by certain field lets say difficulty then we can pass that field name in _id then the result will be no_of_documents grouped by same difficulty field and below calculation will be performed on those individual groups | But note we can't pass the any condition in _id we can only pass the field name and $group will group all the documents containing same field value which we pass [in this example difficulty] | YOU CAN EXPERIMENT🧪 WITH THIS AND YOU WILL GET THE IDEA💡.
          totalRatings: { $sum: '$ratingsQuantity' }, // $sum query is will return the total after adding all the value of ratingQuantity field of all documents | and we have to pass the field name in string with $ in front of field name this is the syntax.
          minPrice: { $min: '$price' }, // $min return the minimum value
          avgPrice: { $avg: '$price' }, // $avg return the avg value
          maxPrice: { $max: '$price' }, // $max returns the maximum value
          avgRating: { $avg: '$ratingsAverage' },
          noOfTours: { $sum: 1 }, // now this $sum query will add 1 in noOftours for all the documents filtered by above $match query
        },
      },
      {
        // now we sort the reslted documents acc. to fields we define in $group block/stage
        $sort: {
          avgRating: 1, // this will sort the resulted documents in ascending order of minPrice
        },
      },
    ])
    // NOTE in aggregation pipline each object/stage passed in the array inside of aggregate function will depends on result given by previous object/stage | In above example $group stage/object/operator will only group the documents returned/filtered/given after $match stage/query completed its action and also $sort will only sort the documents returned by/from $group operator/stage that why we can't use field name from document we started with in aggregate method we can only sort the documents depends on fields returned from $group stage

    res.status(200).json({
      status: '✅success',
      statusCode: 200,
      results: stats.length,
      data: {
        stats,
      },
    })
  } catch (err) {
    next(err)
  }
}

const getMonthlyPlan = async (req, res, next) => {
  try {
    const year = +req.params.year

    // CREATING A AGGREGATION PIPELINE TO SOLVE A BUISNESS PROBLEM
    // PROBLEM: Is to find the busiest month of the year in this Dummy Natours Project
    const plan = await TourModel.aggregate([
      {
        // Starting by desstructuring all our tours in single document acc. to values in startDates
        $unwind: '$startDates', // this unwind will divide our single document containing this startDates array into noOfTimes of length of this array and this startDates field will only have one value instead of array | SEE THE RESULTS👀
      },
      // now as explained above now $match opertaion will get performed on the resulted documents from above $unwind stage/query.
      {
        $match: {
          startDates: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          noOfTours: { $sum: 1 },
          tours: { $push: '$name' }, // now in order to find no of tours in a month we have to create an array of tours. so to do that we have $push operator which will create an array with value of field we provide.
        },
      },
      { $addFields: { month: '$_id' } }, // this $addFields operator will create a new field with a value we want in this example we want to omit _id field and instead add a month field with month
      { $project: { _id: 0 } }, // now this $project operator will help use to omit or show certain field as we do in projection of find() method 0 - for remove field 1 - for show field | ALSO SAME RULES APPLY HERE THAT WE WANT MIX MATCH 0 AND 1 EXCEPT _id FOR EX: tours: 0 noOfTours: 1 // NOT VALID , _id: 0 tours: 1 // VALID
      {
        $sort: {
          noOfTours: -1,
        },
      },
    ])

    res.status(200).json({
      status: '✅success',
      statusCode: 200,
      results: plan.length,
      data: {
        plan,
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  deleteTour,
  getAllTours,
  getSingleTour,
  createTour,
  updateTour,
  getTourStats,
  getMonthlyPlan,
}
