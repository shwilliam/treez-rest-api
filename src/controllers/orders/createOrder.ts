import {Request, Response} from 'express'
import {db} from '../../db'

const createOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const newOrder = await db.orders.add(req.body)

    return res.status(201).json(newOrder)
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default createOrder
