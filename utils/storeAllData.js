console.clear()
const fs = require('fs')
const mongoose = require('mongoose')
const dotEnv = require('dotenv')
const tourModel = require('../models/tourModel')

dotEnv.config({ path: `${__dirname}/../config.env` })

console.log(process.env.ATLAS_DATABASE, process.env.DATABASE_PASS)

const dbLink = process.env.ATLAS_DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASS
)

const data = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
)

mongoose.connect(dbLink).then(() => {
  tourModel.create(data).then(() => {
    console.log('data stored')
    process.exit() // this will force stop our node code execution
  })
})
