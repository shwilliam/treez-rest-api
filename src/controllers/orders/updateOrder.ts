import {Request, Response} from 'express'
import {db} from '../../db'

const updateOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    await db.orders.update({
      ...req.body,
      id: req.params.id,
      products: req.body.products ? JSON.parse(req.body.products) : null
    })

    return res.json({id: req.params.id})
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default updateOrder
