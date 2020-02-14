import express from 'express'
import {getInventory, createInventoryItem} from '../controllers/inventory'

const inventoriesRouter = express.Router()

inventoriesRouter
  .get('/', getInventory)
  .post('/', createInventoryItem)

export default inventoriesRouter
