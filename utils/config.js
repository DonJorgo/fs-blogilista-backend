/* eslint-disable no-undef */
require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.NOSE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT
}