import {Request, Response} from 'express'
import {db} from '../../db'

const updateInventoryItem = async (req: Request, res: Response): Promise<Response> => {
  try {
    await db.inventory.update({
      ...req.body,
      id: req.params.id,
    })

    return res.json({id: req.params.id})
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default updateInventoryItem
