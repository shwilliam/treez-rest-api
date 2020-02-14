import {IDatabase} from 'pg-promise'
import {IInventory} from '../Inventory'

class Inventory {
  constructor(private db: IDatabase<any>) {
    this.db = db
  }

  async findAll(): Promise<IInventory[]> {
    return this.db.any('SELECT * FROM inventory ORDER BY id ASC;')
  }

  async add(newInventoryItem: IInventory): Promise<IInventory> {
    const {id, name, description, price, quantity} = newInventoryItem

    return this.db.one(
      'INSERT INTO inventory (id, name, description, price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [id, name, description || '', price, quantity],
    )
  }
}

export default Inventory
