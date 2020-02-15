import express from 'express'
import {getOrders, getOrder, createOrder, updateOrder, deleteOrder} from '../controllers/orders'

const ordersRouter = express.Router()

ordersRouter
  .get('/', getOrders)
  .get('/:id', getOrder)
  .post('/', createOrder)
  .put('/:id', updateOrder)
  .delete('/:id', deleteOrder)

export default ordersRouter
