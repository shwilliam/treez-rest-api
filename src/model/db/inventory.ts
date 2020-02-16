import {IDatabase} from 'pg-promise'
import {IInventory, IAddInventoryPayload, IInventoryUpdatePayload} from '../Inventory'

class Inventory {
  constructor(private db: IDatabase<any>) {
    this.db = db
  }

  async findAll(): Promise<IInventory[]> {
    return this.db.any('SELECT * FROM inventory ORDER BY id ASC;')
  }

  async find(id: string): Promise<IInventory> {
    return this.db.one('SELECT * FROM inventory WHERE id = $1;', [id])
  }

  async add(newInventoryItem: IAddInventoryPayload): Promise<IInventory> {
    const {name, description, price, quantity_remaining} = newInventoryItem

    return this.db.one(
      'INSERT INTO inventory (name, description, price, quantity_remaining) VALUES ($1, $2, $3, $4) RETURNING *;',
      [name, description || '', price, quantity_remaining],
    )
  }

  async delete(id: string): Promise<null> {
    return this.db.none('DELETE FROM inventory WHERE id = $1;', [id])
  }

  async update({id, name, description, price, quantity_remaining}: IInventoryUpdatePayload): Promise<string> {
    await this.db.none(
      `UPDATE inventory SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        quantity_remaining = COALESCE($5, quantity_remaining)
      WHERE id = $1;`,
      [id, name, description, price, quantity_remaining],
    )

    return id
  }
}

export default Inventory