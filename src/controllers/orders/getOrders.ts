import {Response} from 'express'
import {db} from '../../db'

const getOrders = async ({}, res: Response): Promise<Response> => {
  try {
    const ordersRes = await db.orders.findAll()

    return res.json(ordersRes)
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default getOrders
