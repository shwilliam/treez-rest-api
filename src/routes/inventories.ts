import express from 'express'
import {
  getInventory,
  createInventoryItem,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventory'

const inventoriesRouter = express.Router()

inventoriesRouter
  .get('/', getInventory)
  .get('/:id', getInventoryItem)
  .post('/', createInventoryItem)
  .put('/:id', updateInventoryItem)
  .delete('/:id', deleteInventoryItem)

export default inventoriesRouter
