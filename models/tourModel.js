// to create a schema we first import Schema from mongoose as shown below
const { Schema, model } = require('mongoose')
// const slugify = require('slugify')

// creating a tourSchema now Schema is contructor in which we can define how many fields we want and set its type and if they are required or not and also we can set some default values for some field as shown below
const TourSchema = new Schema({
  name: {
    type: String,
    unique: true, // this property will make sure that in same collection there cannot be multiple documents with same name
    required: [true, 'A tour must have a name field'], // if you want to specify some error string if this field is not required at the time of creating a object/document using this schema
    trim: true,
    maxLength: [20, "Name of a tour can't have more than 20 characters"], // maxLength is also a DATA-VALIDATOR,
    minLength: [10, 'Name must be 10 character long'], // ANOTHER DATA-VALIDATOR
    // these validators only work while creation of new document not when a document is being updated/modified to enable that you have to set runValidators: true in updating methods
  },
  // USING MONGOOSE BUILT_IN DATA-VALIDATORS one them is required which tell that certain field is required or not and if user doesn't give that field then it will return the error we passed as second argument in array. ALL Data validators accept an array in which 1st value is the validator and second is error forEX: required: [true, 'this field must have some value'] || this will throw 2nd string as error if certain field value is not given by user
  ratingsAverage: {
    type: Number,
    default: 4.5, // this will set as default value if no rating got from user
    min: [1, "rating can't be less than 1⭐"], // DATA-VALIDATOR // ONLY FOR Numbers and Date
    max: [5, "rating can't be more than 5⭐⭐⭐⭐⭐"], // DATA-VALIDATOR // ONLY FOR Numbers and Date
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty can only be one these "easy" "medium" "difficult"',
    }, // in this enum DATA-VALIDATOR we can specific by fixed values for certain fields if user entered any other than specified value then message string will get returned as error // ONLY FOR STRING
  },
  priceDiscount: {
    type: Number,
    // now we can create our custom validation for any fields with validate property in which we pass object inside of that object in validator field we pass the function which receives the entered value as argument and we have to return true or false and there is message property which hold the error message
    validate: {
      validator: function (inpVal) {
        // NOTE: in validator functions this keyword only points to document while in creation phase not when we want to update document
        // checking if discount price less than orignal price or not
        return inpVal < this.price // if condition is false then this will through error
      },
      message: "Discounted price can't be greater or equal to orignal price",
    },
  },
  summary: {
    type: String,
    trim: true, // removes extra space from begining and end
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String], // this means type is array of strings
  createdAt: {
    type: Date, // by setting type to date mongo will automatically convert into JS date object
    default: Date.now(),
  },
  slug: String,
  startDates: [Date],
})

// In Mongoose we also have middleware which is pre() and post() middleware | pre() will get called any operation happens like document creation performing query this pre middleware needs two parameter 1) is 'value' | value is for which kind of action we want to hook this up which tell it to run before any action happens, and 2) is the function in which this keyword points to the document being created or filtered (and for this reason we have to use regular function expression not the arrow function)
// DOCUMENT MIDDLEWARE: Document middleware only works with .save() and .create() method
TourSchema.pre('save', function (next) {
  // this.slug = slugify(this.name, { lower: true }) // forEx: name is the     tour | then slug will be the-tour

  // achieving same result as slygify from vanilla JS
  const name = this.name
    .toLowerCase() // converting to lowercase
    .split(' ') // spliting with space
    .filter((res) => res) // filtering extra space as we know '' empty string is a falsy
    .join('-') // then joining with -
  console.log(name)
  next()
})

// QUERY MIDDLEWARE: Works when we any query opertaions like sorting finding certain documents etc for this we pass 'find' as 1st argument in pre() method.

// now to create a model we just use model method imported above from mongoose then we pass name for model and schema | Model is used to insert a document in collection in database with data matching the schema defined above (this allow us to structure our documents in similar way in same collection | although thats not necessary)
module.exports = model('Tours', TourSchema) // by this whenever we use this model to create a document in our database mongoose which automatically create a collection (if collection doesn't exist) with the name (converted in lowercase) we pass as first argument in model in this ex: tour
