module.exports = class AppError extends Error {
  constructor(message, statusCode) {
    super(message) // calling super to call the Error class constructor in order to create a real error object

    this.statusCode = statusCode
    this.status = `${this.statusCode}`[0] === '4' ? 'Fail⚠️' : 'Error💥' // setting error status depends upon status code because error status can only be fail or error depends on statusCode
  }
}
