import {IDatabase} from 'pg-promise'
import {
  IOrder,
  IOrderPayload,
  TProductOrderPayload,
  IOrderUpdatePayload,
  IOrderSummary,
  IOrderDetails,
} from '../Order'

class Orders {
  constructor(private db: IDatabase<any>) {
    this.db = db
  }

  async find(id: string): Promise<IOrderSummary | null> {
    const orderDetails = await this.db.any(
      `SELECT * FROM orders
        INNER JOIN order_quantities ON orders.id = order_quantities.order_id
        INNER JOIN inventory ON inventory.id = order_quantities.product_id
        WHERE orders.id = $1;`,
      [id],
    )

    return orderDetails.length ? ({
      email: orderDetails[0].email,
      date: orderDetails[0].date,
      status: orderDetails[0].status,
      id: orderDetails[0].order_id,
      products: orderDetails.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.number,
        quantity: product.quantity,
      }))
    }) : null
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
              `UPDATE inventory SET quantity_remaining = quantity_remaining - $2
                WHERE id = $1;`,
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

  async delete(id: string): Promise<null> {
    return this.db.tx(async t => {
      const currentOrder = await t.one('SELECT * from orders WHERE id = $1;', [id])

      if (currentOrder.status === 'IN_PROGRESS')
        throw new Error('Cannot delete order with status IN_PROGRESS')

      return t.batch([
        await t.none('DELETE FROM order_quantities WHERE order_id = $1;', [id]),
        await t.none('DELETE FROM orders WHERE id = $1;', [id])
      ])
    })
  }

  async replace(id: string, products: TProductOrderPayload): Promise<string> {
    return this.db.tx(async t => {
      const currentOrder = await t.any(
        `SELECT * FROM orders
          INNER JOIN order_quantities
            ON orders.id = order_quantities.order_id
          WHERE orders.id = $1;`,
        [id],
      )

      // remove order quantities and update inventory quantities
      await t.batch([
        ...currentOrder
          .map(({product_id, quantity}: IOrderDetails) => (
            t.none('UPDATE inventory SET quantity_remaining = quantity_remaining + $2 WHERE id = $1;', [product_id, quantity]))
          ),
        t.none('DELETE FROM order_quantities WHERE order_id = $1;', [id]),
      ])

      // insert new order details and update inventory quantities
      await t.batch([
        ...products
          .map(([product_id, quantity]) => (
            t.none('UPDATE inventory SET quantity_remaining = quantity_remaining - $2 WHERE id = $1;', [product_id, quantity]))
          ),
        ...products
          .map(([product_id, quantity]) => (
            t.none(
              `INSERT INTO order_quantities (order_id, product_id, quantity)
                VALUES ($1, $2, $3);`,
              [id, product_id, quantity],
            )
          )),
      ])

      return id
    })
  }

  async update({id, products, email: newEmail, status: newStatus}: IOrderUpdatePayload): Promise<string> {
    return this.db.tx(async t => {
      const queries: Promise<any>[] = []

      const currentOrder = await this.db.any(
        `SELECT * FROM orders
          INNER JOIN order_quantities
            ON orders.id = order_quantities.order_id
          WHERE orders.id = $1;`,
        [id],
      )
      const {status: currentStatus} = currentOrder[0]

      // update order products
      if (products) {
        if (currentStatus !== 'IN_PROGRESS')
          throw new Error(`Unable to update products on order with status ${currentStatus}`)

        await this.replace(id, products)
      }

      // update order status
      if (['CANCELLED', 'COMPLETE'].includes(newStatus)) {
        if (currentStatus !== 'IN_PROGRESS')
          throw new Error(`Unable to change status of order with status ${currentStatus}`)

        if (newStatus === 'CANCELLED') {
          // restore inventory quantities
          currentOrder.forEach(({product_id, quantity}) => queries.push(
            this.db.none(
              'UPDATE inventory SET quantity_remaining = quantity_remaining + $2 WHERE id = $1',
              [product_id, quantity],
            )
          ))
        }

      } else if (newStatus === 'IN_PROGRESS'){ // restore order
        if (currentStatus !== 'CANCELLED')
          throw new Error(`Unable to change status of order with status ${currentStatus}`)

        await t.batch(
          currentOrder
            .map(({product_id, quantity}) => (
              t.none('UPDATE inventory SET quantity_remaining = quantity_remaining - $2 WHERE id = $1;', [product_id, quantity]))
            ),
        )
      }

      if (newStatus) queries.push(
        this.db.none('UPDATE orders SET status = $2 WHERE id = $1;', [id, newStatus])
      )

      if (newEmail) queries.push(
        this.db.none('UPDATE orders SET email = $2 WHERE id = $1;', [id, newEmail])
      )

      await t.batch(queries)

      return id
    })
  }
}

export default Orders
