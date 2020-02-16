import {Response} from 'express'
import {db} from '../../db'

const getInventory = async ({}, res: Response): Promise<Response> => {
  try {
    const inventoryRes = await db.inventory.findAll()

    return res.json(inventoryRes)
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export default getInventory
