const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This Routes not implemented yet!!',
  })
}

const getUser = (req, res) => {
  console.log(req.params.id)
  res.status(500).json({
    status: 'fail',
    message: 'This Routes not implemented yet!!',
  })
}

const postNewUser = (req, res) => {
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

module.exports = { deleteUser, getAllUsers, getUser, postNewUser, updateUser }
