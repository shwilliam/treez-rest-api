import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {inventories, orders} from './routes'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

app.use('/inventories', inventories)
app.use('/orders', orders)

export {app}
