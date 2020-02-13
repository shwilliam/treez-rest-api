import {IDatabase} from 'pg-promise'
import {IInventory} from '../models/inventory'

class Inventory {
  constructor(private db: IDatabase<any>) {
    this.db = db
  }

  async findAll(): Promise<IInventory[]> {
    return this.db.any('SELECT * FROM inventory;')
  }

  async add(newInventoryItem: IInventory): Promise<string> {
    const {name, description, price, quantity} = newInventoryItem

    return this.db.one(
      'INSERT INTO inventory (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *;',
      [name, description || '', price, quantity],
    )
  }
}

export default Inventory
