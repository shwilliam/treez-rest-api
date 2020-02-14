import express from 'express'
import {getOrders, createOrder} from '../controllers/orders'

const ordersRouter = express.Router()

ordersRouter
  .get('/', getOrders)
  .post('/', createOrder)

export default ordersRouter
