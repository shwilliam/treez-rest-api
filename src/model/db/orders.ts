import {IDatabase} from 'pg-promise'
import {
  IOrder,
  IOrderPayload,
  TProductOrderPayload,
  IOrderUpdatePayload,
  IOrderSummary,
  IOrderDetails,
  TProductQuantities,
} from '../Order'

class Orders {
  constructor(private db: IDatabase<any>) {
    this.db = db
  }

  async find(id: string): Promise<IOrderSummary | null> {
    const orderDetails = await this.db.any(
      `SELECT * FROM orders
        INNER JOIN product_orders ON orders.id = product_orders.order_id
        INNER JOIN inventory ON inventory.id = product_orders.product_id
        WHERE orders.id = $1;`,
      [id],
    )

    if (!orderDetails || !orderDetails.length) return null

    const {email, date, status, order_id} = orderDetails[0]
    return ({
      email,
      date,
      status,
      id: order_id,
      products: orderDetails.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.number,
        quantity: product.quantity,
      }))
    })
  }

  findProductOrders(id: string): Promise<IOrderDetails[]> {
    return this.db.any(
      `SELECT * FROM orders
        INNER JOIN product_orders
          ON orders.id = product_orders.order_id
        WHERE orders.id = $1;`,
      [id],
    )
  }

  findAll(): Promise<IOrder[]> {
    return this.db.any('SELECT * FROM orders;')
  }

  add({products, email}: IOrderPayload): Promise<IOrder> {
    return this.db.tx(async t => {
      const newOrder = await t.one('INSERT INTO orders (email) VALUES ($1) RETURNING *;', [email])

      await t.batch(
        JSON.parse(products)
          .reduce((queries: Promise<any>[], [product_id, quantity]: TProductQuantities) => ([
            ...queries,
            this.updateInventoryQuantity(product_id, Number(quantity) * -1),
            t.none(
              `INSERT INTO product_orders (order_id, product_id, quantity)
                VALUES ($1, $2, $3);`,
              [newOrder.id, product_id, quantity],
            ),
          ]), [])
      )

      return newOrder
    })
  }

  delete(id: string): Promise<null> {
    return this.db.tx(async t => {
      const currentOrder = await t.one('SELECT * from orders WHERE id = $1;', [id])

      if (currentOrder.status === 'IN_PROGRESS')
        throw new Error('Cannot delete order with status IN_PROGRESS')

      await t.batch([
        await t.none('DELETE FROM product_orders WHERE order_id = $1;', [id]),
        await t.none('DELETE FROM orders WHERE id = $1;', [id])
      ])

      return currentOrder
    })
  }

  replace(id: string, products: TProductOrderPayload): Promise<string> {
    return this.db.tx(async t => {
      const currentOrder = await t.findProductOrders(id)

      // remove order quantities and update inventory quantities
      await t.batch([
        ...currentOrder
          .map(({product_id, quantity}: IOrderDetails) => (
            this.updateInventoryQuantity(product_id, quantity)
          )),
        t.none('DELETE FROM product_orders WHERE order_id = $1;', [id]),
      ])

      // insert new order details and update inventory quantities
      await t.batch([
        ...products
          .map(([product_id, quantity]) => (
            this.updateInventoryQuantity(product_id, quantity * -1)
          )),
        ...products
          .map(([product_id, quantity]) => (
            t.none(
              `INSERT INTO product_orders (order_id, product_id, quantity)
                VALUES ($1, $2, $3);`,
              [id, product_id, quantity],
            )
          )),
      ])

      return id
    })
  }

  update({id, products, email: newEmail, status: newStatus}: IOrderUpdatePayload): Promise<string> {
    return this.db.tx(async t => {
      const queries: Promise<any>[] = []

      const currentOrder = await this.findProductOrders(id)
      const {status: currentStatus} = currentOrder[0]

      // update order products
      if (products) {
        if (currentStatus !== 'IN_PROGRESS')
          throw new Error(`Unable to update products on order with status ${currentStatus}`)

        queries.push(this.replace(id, products))
      }

      // update order status
      if (newStatus) {
        switch (newStatus) {
          case 'CANCELLED':
            if (currentStatus !== 'IN_PROGRESS')
              throw new Error(`Unable to change status of order with status ${currentStatus}`)

            // restore inventory quantities
            currentOrder.forEach(({product_id, quantity}) => queries.push(
              this.updateInventoryQuantity(product_id, quantity)
            ))
            break

          case 'COMPLETE':
            if (currentStatus !== 'IN_PROGRESS')
              throw new Error(`Unable to change status of order with status ${currentStatus}`)
            break

          case 'IN_PROGRESS':
            if (currentStatus !== 'CANCELLED')
              throw new Error(`Unable to change status of order with status ${currentStatus}`)

            // restore order
            currentOrder
              .forEach(({product_id, quantity}) => queries.push(
                this.updateInventoryQuantity(product_id, quantity * -1)
              ))
            break

          default:
            break
        }

        queries.push(
          this.db.none('UPDATE orders SET status = $2 WHERE id = $1;', [id, newStatus])
        )
      }

      if (newEmail) queries.push(
        this.db.none('UPDATE orders SET email = $2 WHERE id = $1;', [id, newEmail])
      )

      await t.batch(queries)

      return id
    })
  }

  updateInventoryQuantity(id: string, quantity: number): Promise<null> {
    return this.db.none(
      'UPDATE inventory SET quantity_remaining = quantity_remaining + $2 WHERE id = $1;',
      [id, quantity],
    )
  }

}

export default Orders
