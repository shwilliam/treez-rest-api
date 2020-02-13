require('dotenv').config()

const supertest = require('supertest')

export const request = supertest(
  `http://${process.env.HOST}:${process.env.PORT}`,
)
