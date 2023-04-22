const express = require('express')
const UserController = require('../controllers/userController')

const router = express.Router()

// Get all users / post new user
router
  .route('/')
  .get(UserController.getAllUsers)
  .post(UserController.postNewUser)

// GET / Update / Delete user
router
  .route('/:id')
  .get(UserController.getUser)
  .delete(UserController.deleteUser)
  .patch(UserController.updateUser)

module.exports = router
