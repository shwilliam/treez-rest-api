import {Request, Response} from 'express'
import {db} from '../../db'

const getInventoryItem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const inventoryItemRes = await db.inventory.find(req.params.id)

    return res.json(inventoryItemRes)
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default getInventoryItem
