import {IDatabase} from 'pg-promise'
import {IOrder, IOrderPayload, TProductOrderPayload} from '../Order'

class Orders {
  constructor(private db: IDatabase<any>) {
    this.db = db
  }

  async findAll(): Promise<IOrder[]> {
    return this.db.any('SELECT * FROM orders;')
  }

  async add({products, email}: IOrderPayload): Promise<IOrder> {
    return this.db.tx(async t => {
      const newOrder = await t.one('INSERT INTO orders (email) VALUES ($1) RETURNING *;', [email])

      await t.batch(
        JSON.parse(products)
          .reduce((queries: Promise<any>[], [product_id, quantity]: TProductOrderPayload) => ([
            ...queries,
            t.none(
              `UPDATE inventory SET quantity = quantity - $2
                WHERE ID = $1;`,
              [product_id, quantity],
            ),
            t.none(
              `INSERT INTO order_quantities (order_id, product_id, quantity)
                VALUES ($1, $2, $3);`,
              [newOrder.id, product_id, quantity],
            ),
          ]), [])
      )

      return newOrder
    })
  }
}

export default Orders
