import {IDatabase} from 'pg-promise'
import {IOrder} from '../models/order'

class Orders {
  constructor(private db: IDatabase<any>) {
    this.db = db
  }

  async findAll(): Promise<IOrder[]> {
    return this.db.any('SELECT * FROM orders;')
  }
}

export default Orders
