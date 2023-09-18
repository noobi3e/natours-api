const { Schema, model } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'An email is required for signing up'],
    unique: true,
    trim: true,
    lowerCase: true, // transform data into lowerCase
    validate: [validator.default.isEmail, 'Enter a valid email'], // using a third party validator package to validate the email
  },
  displayPic: {
    type: String,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'user', 'lead-guide', 'guide'],
  },
  password: {
    type: String,
    required: [true, 'Pls enter a password to sign in'],
    minLength: [8, 'Password have to be 8 character long'],
    trim: true,
  },
  confirmPassword: {
    type: String,
    trim: true,
    required: [true, 'Pls confirm password to sign in'],
    validate: {
      message: "Password can't be different",
      validator: function (val) {
        return val === this.password
      },
    },
  },
  passChangedAt: Date,
  passResetToken: String,
  passResetTime: Date,
})

// Creating Document Middleware to encrypt the Passwords because we should never store the password as plain text we always have to encrypt it firts in order to save it to database, now there is most popular and secure pass encryption algorithm called as bcrypt can we can use a package named bcryptjs to use this algorithm
UserSchema.pre('save', async function (next) {
  // this isModified method will return true if certain field is modified or not and we have to pass field name in string
  if (!this.isModified('password')) return next()

  // asigning value to passChangedAt
  // this.isNew will return true if new document is created because save() method not only create a new document its also update a existing document
  if (!this.isNew) this.passChangedAt = Date.now() - 5000 // this will only get trigered when existing document got modified not when new document is created | because we don't want to add this property when new user is added we only want to add this property whenever password get modified | we are deducting 5s because saving data to DB can take sometime so there can be case where we create a JWT before this time is set so then this can cause error because we are using this field to verify JWT as authenticated.

  // using bcrypt to encrypt user pass
  this.password = await bcrypt.hash(this.password, 12).then((res) => res) // now this hash method takes two arguments one is string to be encrypted and a salt number which determine how strongly our pass will get encrypted for ex: highest the number higher the encryption but also note this is CPU intensive task which will take alot time if CPU is weak or salt number is too much | you can see effect even by increasing 1 number | then this will return a promise which we can await IDE could complain about that for that you can use a then block and from that then returns the resulted data and await that.

  // now we don't need to store confirmPassword field to database because thatis just for user validation | and to do that we simply set confirmPassword to undefined as we know fields have undefined value will not get stored in database.
  // you may think this field is required so how this work but keep this in mind that required means field should have some value that value can be anything
  this.confirmPassword = undefined
  next()
})

UserSchema.methods.checkPass = function (userInp) {
  return bcrypt.compare(userInp, this.password) // this will return promise which upon resolving return true or false
}

UserSchema.methods.isPasswordChanged = function (JWTTimeStamp) {
  if (!this.passChangedAt) return false

  const passChangeTime = new Date(this.passChangedAt).getTime() / 1000

  return passChangeTime > JWTTimeStamp
}

UserSchema.methods.createResetPasswordToken = function () {
  // now we will create two field in our schema which will store encrypted token and the time after which this token should expires
  // creating resetToken using built in crypto package because this is no need to create a completely secure secret token because that will gonna expire anyways and doesn't contains any curcial information
  const resetToken = crypto.randomBytes(35).toString('hex') // this will create a random string with characters defined in randomBytes() method

  // now we encrypt that resetToken to store it in schema so that hacker couldn't simply get our token but as we know this info id not that crucial and also gonna expire we don't need highly secure encryption
  this.passResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex') // this is synax of creating a encrypt version of above resetToken

  this.passResetTime = Date.now() + 5 * 60 * 1000 // setting token reset time to 5 min but as we knoe Date.now() return time in milliseconds so we have to convert 5 min to milliseconds as shown in this example

  return resetToken // now we return the token to verify later
}

UserSchema.methods.resetPassword = function (pass, confirmPass) {
  this.password = pass
  this.confirmPassword = confirmPass

  this.passResetTime = undefined
  this.passResetToken = undefined
}

const UserModel = model('users', UserSchema)
module.exports = UserModel
