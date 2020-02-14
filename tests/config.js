require('dotenv').config()

const {app} = require('../dist/app')
const supertest = require('supertest')

export const request = supertest(app)
