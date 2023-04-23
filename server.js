console.clear()
const dotenv = require('dotenv')
const app = require('./app')
const mongoose = require('mongoose')

dotenv.config({ path: './config.env' })

const dbLink = process.env.ATLAS_DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASS
)

const port = process.env.PORT
let server

// now using mongoose as a driver to connect our express app to mongoDB either atlas or local
// getting link to connect to mongoDB
// connecting to mongodb using mongoose is very simple we just have to call connect method on mongoose with connection URI (we got from atlas) as argument which will return a promise
mongoose
  .connect(dbLink)
  .then(() => {
    // this block will executed if connection success
    console.log('Connect to mongoDB Atlas')

    // now we should connect to server once database connected successfully
    // we only starts our server when database is connected
    server = app.listen(port, () =>
      console.log(`Api is running on http://localhost:${port}`)
    )
  })
  .catch((err) => console.warn(err))

// in mongoose we works with schema and models which mongoose provide us out of the box
// Schema is way define a structure for our data to get store in the database
// model is wrapper around schema which allow us to perform crud operations

// Handling all unhandled promises rejection like if mongo unable to connect or in our if there is any unhandled promise rejection then we have to handle it in one place because we have to keep in mind that as a programmer we always makes mistakes that can cause error
// we will will process variable which emit a event whenever there is unhandled promise and we can listen to that event and perform some actions
// to listen for event on process we have on method and the event is 'unhandledRejection' and as a second argument we pass a function which has access to error variable
process.on('unhandledRejection', (err) => {
  console.log('coming from process')
  console.warn(err.name, err.message) // logging error name and message

  // whenever there is unhandled promise then we can turn of the server
  server.close(() => {
    process.exit(1)
  })
})
// in brief above listener which is listening for 'unhandledRejection' event will act only on unhandled error that occurs in async code which also called rejection
