const {db} = require('../dist/db')

const clearOrders = async () => {
  await db.none('DELETE FROM order_quantities;')
  await db.none('DELETE FROM orders;')
}

const clearInventory = async () => {
  await db.none('DELETE FROM inventory;')
}

const initStockedInventory = async products => {
  await Promise.all(
    products.map(({id, name, price, description, quantity}) =>
      db.none(
        `INSERT INTO inventory (id, name, price, description, quantity)
          VALUES ($1, $2, $3, $4, $5);`,
        [id, name, price, description, quantity],
      ),
    ),
  )
}

const formatMonetaryDecimal = num => String(num.toFixed(2))

const sortByID = (a, b) => a.id > b.id

const containsSameProducts = arr => res =>
  res.body.length === arr.length &&
  res.body.every(product => arr.includes(product))

const mockInventory = [
  {
    id: 1,
    name: 'Item 1',
    description: 'Desc',
    price: 20,
    quantity: 10,
  },
  {
    id: 2,
    name: 'Item 2',
    description: 'Desc 2',
    price: 62.5,
    quantity: 120,
  },
]

const mockID = 'testid'

module.exports = {
  clearOrders,
  clearInventory,
  initStockedInventory,
  formatMonetaryDecimal,
  sortByID,
  containsSameProducts,
  mockInventory,
  mockID,
}
