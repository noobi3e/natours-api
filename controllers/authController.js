const UserModel = require('../models/userModel')
const AppError = require('../utils/AppError')
const JWT = require('jsonwebtoken')
const crypto = require('crypto')

// CREATING NEW USER
exports.createNewUser = async (req, res, next) => {
  try {
    // extractin values
    const userCredit = {
      password: req.body.pass,
      confirmPassword: req.body.confirmPass,
      email: req.body.email,
      name: req.body.name,
      passChangedAt: req.body.passChangedAt,
      role: req.body.role,
      displayPic: req.body.pic,
    }

    // creating user
    const user = await UserModel.create(userCredit)

    // extracting field we want to send to user
    const { _id, name, email } = user

    res.status(201).json({
      status: '✅Success',
      statusCode: 201,
      message: 'User created successfully',
      userCrediential: {
        _id,
        name,
        email,
      },
    })
  } catch (err) {
    next(err)
  }
}

// LOGGING USER IN
exports.loginUser = async (req, res, next) => {
  try {
    // checking email and password
    const { email, pass } = req.body

    if (!(email && pass))
      throw new AppError('Please enter both email and password', 404)

    // finding user by email | this will return null if no document with this email is present
    const user = await UserModel.findOne({ email })

    // checking pass is correct or not
    const passIsCorrect = user && (await user.checkPass(pass))

    // if there is any value in passIsCorrect means there is a user so we can only check for password
    if (!passIsCorrect)
      throw new AppError('Please correct email or password', 401)

    // creating a JWT
    const jsonWebToken = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    })

    res.status(200).json({
      status: '✅Success',
      statusCode: 200,
      message: `User with name of ${user.name} found`,

      userCredientials: {
        _id: user._id,
        email: user.email,
        name: user.name,
        authToken: jsonWebToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

// USER AUTHENTICATION MIDDLEWARE
exports.authenticateUser = async (req, res, next) => {
  try {
    // 1) checking there is any token recieved or not

    let token = req.headers.authorization

    if (token && token.startsWith('bearer')) {
      token = token.split('=')[1]
    }

    if (!token)
      throw new AppError('No user found for this token, Please try again', 401)

    // 2) if token is valid or not
    const decodedJWT = JWT.verify(token, process.env.JWT_SECRET) // this will automatically throw an error if anything goes wrong which we can handle in global error middleware

    // 3) checking if user still exists
    const curUser = await UserModel.findById(decodedJWT.id)

    if (!curUser) throw new AppError('This user no longer exists', 404)

    // 4) checking if user changed their password after the JWT issued
    const passChanged = curUser.isPasswordChanged(decodedJWT.iat)

    if (passChanged)
      throw new AppError(
        'This user changed his/her password, Please log in again.',
        410
      )

    // 5) gives access to route user is requesting
    // passing user object as field on req object to make it available in next middleware in case they need that info for like authorization
    req.user = curUser
    next()
  } catch (err) {
    next(err)
  }
}

// specific roles
const crudAuthRoles = ['admin', 'lead-guide']

exports.authorizeUser = async (req, res, next) => {
  try {
    const user = req.user
    console.log(user)

    const roleMatched = crudAuthRoles.some((role) => role === user.role)

    if (!roleMatched)
      throw new AppError('user is not authorized to perform this action', 401)

    next()
  } catch (err) {
    next(err)
  }
}

// now in order to allow user to click on forget-pasword and reset their password we have to follow an approach to do that for this we can create a token and then send that token to user and user will send that token back with new password then we update user password with new password | now to create that token we create another instance method in order to follow an approach of fat model and thin controllers
exports.forgetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on email
    const user = await UserModel.findOne({ email: req.body.email })

    if (!user)
      throw new AppError(
        `There is no user linked to ${req.body.email} email, Please create one`,
        404
      )

    // 2) generate random token
    // using yet another instance method called createResetPasswordToken
    const resetToken = user.createResetPasswordToken()

    // now above instance method just created a new field but didn't saves it to DB so now we save it
    await user.save({ validateModifiedOnly: true }) // now when we run .save() normally this will run validators again now to avoid that we pass an object with option validateModifiedOnly set to true this will only run validators for modified fields

    // 3) send token back

    res.status(200).json({
      status: '✅Success',
      statusCode: 200,
      message: 'send request on below link to reset your password',
      linkToReset: `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/reset-password/${resetToken}`,
    })

    // EMAIL MAY BE LATER
  } catch (err) {
    next(err)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) get user based on token
    console.log(req.params.token)
    console.log(req.body)

    // now we convert/hashed the token got from user and then we find the user by this hashed token by searching for passResetToken field we created.
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    const user = await UserModel.findOne({
      passResetToken: hashedToken,
      passResetTime: { $gt: Date.now() },
    })

    if (!user) throw new AppError(`Token is invalid or expired`, 400)

    // now updating user password and setting reset fields to null | i am using yet another instance method
    user.resetPassword(req.body.pass, req.body.confirmPass)

    await user.save()

    res.status(201).json({
      status: 'Success✅',
      statusCode: 201,
      message: 'password reset successfull',
    })
  } catch (err) {
    next(err)
  }
}

// now implementing updatePassword functionality
exports.updatePassword = async (req, res, next) => {
  try {
    // 1) get user from collection
    const user = await UserModel.findById(req.user._id)

    // 2) password got is correct
    const passIsCorrect = await user.checkPass(req.body.pass)

    if (!passIsCorrect) throw new AppError('Entered password is incorrect', 401)

    // 3) if pass is correct then update the password
    user.password = req.body.newPass
    user.confirmPassword = req.body.newConfirmPass
    await user.save()

    // 4) Log user in , send JWT
    const jsonWebToken = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    })

    res.status(200).json({
      status: 'Success',
      statusCode: 200,
      message: 'Password changed successfully',
      authToken: jsonWebToken,
    })
  } catch (err) {
    next(err)
  }
}
