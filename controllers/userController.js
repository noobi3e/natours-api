const UserModel = require('../models/userModel')

const getAllUsers = async (req, res, next) => {
  try {
    // diaplaying all users but without sensitive and unnecessary fields
    const users = await UserModel.find().select('-__v -password')

    res.status(200).json({
      status: 'Success✅',
      statusCode: 200,
      totalUsers: users.length,
      data: {
        users,
      },
    })
  } catch (err) {
    next(err)
  }
}

const getUser = (req, res) => {
  console.log(req.params.id)
  res.status(500).json({
    status: 'fail',
    message: 'This Routes not implemented yet!!',
  })
}

const deleteUser = (req, res) => {
  console.log(req.params.id)
  res.status(500).json({
    status: 'fail',
    message: 'This Routes not implemented yet!!',
  })
}

const updateUser = (req, res) => {
  console.log(req.params.id)
  res.status(500).json({
    status: 'fail',
    message: 'This Routes not implemented yet!!',
  })
}

module.exports = { deleteUser, getAllUsers, getUser, updateUser }
