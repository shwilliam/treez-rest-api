const {db} = require('../dist/db')

const clearOrders = async () => {
  await db.none('DELETE FROM product_orders;')
  return db.none('DELETE FROM orders;')
}

const clearInventory = () => db.none('DELETE FROM inventory;')

const initStockedInventory = products =>
  Promise.all(
    products.map(
      ({id, name, price, description, quantity_remaining}) =>
        db.none(
          `INSERT INTO inventory (id, name, price, description, quantity_remaining)
          VALUES ($1, $2, $3, $4, $5);`,
          [id, name, price, description, quantity_remaining],
        ),
    ),
  )

const initOrders = async orders => {
  await Promise.all(
    orders.map(({id, email, status}) =>
      db.none(
        `INSERT INTO orders (id, email, status)
          VALUES ($1, $2, $3);`,
        [id, email, status],
      ),
    ),
  )

  return Promise.all(
    orders.map(({id, products}) =>
      Promise.all(
        products.map(([product_id, quantity]) =>
          db.none(
            `INSERT INTO product_orders (order_id, product_id, quantity)
            VALUES ($1, $2, $3);`,
            [id, product_id, quantity],
          ),
        ),
      ),
    ),
  )
}

const formatMonetaryDecimal = num => String(num.toFixed(2))

const containsSameElements = arr => res =>
  res.body.length === arr.length &&
  res.body.every(el => arr.includes(el))

const mockInventory = [
  {
    id: 1,
    name: 'Item 1',
    description: 'Desc',
    price: 20,
    quantity_remaining: 130,
  },
  {
    id: 2,
    name: 'Item 2',
    description: 'Desc 2',
    price: 62.5,
    quantity_remaining: 120,
  },
]

const mockOrders = [
  {
    id: 1,
    email: 'test1@mail.com',
    products: [
      [1, 8],
      [2, 4],
    ],
    status: 'COMPLETE',
  },
  {
    id: 2,
    email: 'test2@mail.com',
    products: [[2, 3]],
    status: 'IN_PROGRESS',
  },
  {
    id: 3,
    email: 'test3@mail.com',
    products: [[2, 2]],
    status: 'CANCELLED',
  },
]

const mockOrderProducts = [
  {
    id: 1,
    order_id: 1,
    product_id: 1,
    quantity: 2,
  },
  {
    id: 2,
    order_id: 1,
    product_id: 2,
    quantity: 1,
  },
]

const mockID = 'testid'

const mockDate = '2020-02-15T02:41:46.168Z'

module.exports = {
  clearOrders,
  clearInventory,
  initStockedInventory,
  initOrders,
  formatMonetaryDecimal,
  containsSameElements,
  mockInventory,
  mockDate,
  mockOrders,
  mockOrderProducts,
  mockID,
}
