import {Request, Response} from 'express'
import {db} from '../../db'

const getOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const orderRes = await db.orders.find(req.params.id)

    return res.json(orderRes)
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default getOrder
