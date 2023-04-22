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

// now using mongoose as a driver to connect our express app to mongoDB either atlas or local
// getting link to connect to mongoDB
// connecting to mongodb using mongoose is very simple we just have to call connect method on mongoose with connection URI (we got from atlas) as argument which will return a promise
mongoose
  .connect(dbLink)
  .then(() => {
    // this block will executed if connection success
    console.log('Connect to mongoDB Atlas')

    // now we should connect to server once database connected successfully
    app.listen(port, () =>
      console.log(`Api is running on http://localhost:${port}`)
    )
  })
  .catch((err) => {
    // this block will execute if conection fail or any error occurred
    console.warn(err)
  })

// in mongoose we works with schema and models which mongoose provide us out of the box
// Schema is way define a structure for our data to get store in the database
// model is wrapper around schema which allow us to perform crud operations
