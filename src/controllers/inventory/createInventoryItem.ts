import {Request, Response} from 'express'
import {db} from '../../db'

const createInventoryItem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const newItem = await db.inventory.add(req.body)

    return res.status(201).json(newItem)
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default createInventoryItem
