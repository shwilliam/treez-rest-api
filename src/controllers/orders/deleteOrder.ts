import {Request, Response} from 'express'
import {db} from '../../db'

const deleteOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const deletedOrder = await db.orders.delete(req.params.id)

    return res.json(deletedOrder)
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default deleteOrder
