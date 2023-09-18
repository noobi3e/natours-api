const express = require('express')
const UserController = require('../controllers/userController')
const AuthController = require('../controllers/authController')

const router = express.Router()

// Logging Users in
router.post('/login', AuthController.loginUser)

// signing up users
router.post('/signup', AuthController.createNewUser)

// forgetPassword
router.post('/forget-password', AuthController.forgetPassword)

// reset password
router.patch('/reset-password/:token', AuthController.resetPassword)

// Get all users
router.get('/', UserController.getAllUsers)

// updatePasWord
router.patch(
  '/update-password',
  AuthController.authenticateUser,
  AuthController.updatePassword
)

// GET / Update / Delete user
router
  .route('/:id')
  .get(UserController.getUser)
  .delete(AuthController.authenticateUser, UserController.deleteUser)
  .patch(UserController.updateUser)

module.exports = router
