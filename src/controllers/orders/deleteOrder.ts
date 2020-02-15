import {Request, Response} from 'express'
import {db} from '../../db'

const deleteOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    await db.orders.delete(req.params.id)

    return res.json({id : req.params.id})
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default deleteOrder
