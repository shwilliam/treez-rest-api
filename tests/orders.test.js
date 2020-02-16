const {request} = require('./config')
const {
  clearOrders,
  clearInventory,
  initStockedInventory,
  initOrders,
  containsSameElements,
  mockInventory,
  mockOrders,
  mockOrderProducts,
  mockID,
  mockDate,
} = require('./utils')
const {db} = require('../dist/db')

describe('/orders', () => {
  describe('GET', () => {
    beforeEach(async () => {
      await clearOrders()
      await clearInventory()
      return initStockedInventory(mockInventory)
    })

    describe('when orders exist', () => {
      beforeEach(() => initOrders(mockOrders))

      it('returns array of orders', done => {
        request
          .get('/orders')
          .expect('Content-Type', /json/)
          .expect(containsSameElements(mockOrders))
          .expect(200, done)
      })
    })

    describe('when no orders', () => {
      it('returns empty array', done => {
        request
          .get('/orders')
          .expect('Content-Type', /json/)
          .expect(200, [], done)
      })
    })
  })

  describe('POST', () => {
    describe('when passed valid params', () => {
      const newOrder = {
        email: 'test1@mail.com',
        products: '[[1, 7], [2, 15]]',
      }

      it('returns new order', done => {
        request
          .post('/orders')
          .send(newOrder)
          .expect('Content-Type', /json/)
          .expect(res => {
            res.body.id = mockID
            res.body.date = mockDate
            res.body.products = mockOrderProducts
          })
          .expect(
            201,
            {
              id: mockID,
              email: newOrder.email,
              date: mockDate,
              status: 'IN_PROGRESS',
              products: mockOrderProducts,
            },
            done,
          )
      })

      it('inserts order into orders db', async done => {
        request
          .post('/orders')
          .send(newOrder)
          .expect('Content-Type', /json/)
          .expect(201)
          .then(async res => {
            const createdID = res.body.id
            const orderRes = await db.orders.find(createdID)
            expect(orderRes).toBeDefined()
            done()
          })
      })

      it('updates inventory quantities', async done => {
        const inventoryItemBeforeUpdate = await db.inventory.find(1)
        const quantityIncrease = JSON.parse(newOrder.products)[0][1]

        request
          .post('/orders')
          .send(newOrder)
          .expect('Content-Type', /json/)
          .expect(201)
          .then(async () => {
            const inventoryItemAfterUpdate = await db.inventory.find(
              1,
            )

            expect(
              inventoryItemAfterUpdate.quantity_remaining,
            ).toEqual(
              inventoryItemBeforeUpdate.quantity_remaining -
                quantityIncrease,
            )
            done()
          })
      })
    })
  })
})

describe('/orders/:id', () => {
  beforeEach(async () => {
    await clearOrders()
    await clearInventory()
    return initStockedInventory(mockInventory)
  })

  describe('GET', () => {
    describe('when order exists', () => {
      beforeEach(() => initOrders(mockOrders))

      it('returns order details', done => {
        request
          .get('/orders/1')
          .expect('Content-Type', /json/)
          .expect(res => {
            res.body.date = mockDate
            res.body.products = mockOrderProducts
          })
          .expect(
            200,
            {
              id: mockOrders[0].id,
              email: mockOrders[0].email,
              date: mockDate,
              status: mockOrders[0].status,
              products: mockOrderProducts,
            },
            done,
          )
      })
    })
  })

  describe('DELETE', () => {
    describe('when order exists', () => {
      beforeEach(() => initOrders(mockOrders))

      it('removes order from db', async done => {
        request
          .delete('/orders/1')
          .expect(200)
          .then(async () => {
            const order = await db.orders.find(1)
            expect(order).toBeNull()
            done()
          })
      })
    })
  })

  describe('PUT', () => {
    describe('when order exists', () => {
      beforeEach(() => initOrders(mockOrders))

      it('updates order details', done => {
        const updatedOrderDetails = {
          email: 'new@mail.com',
        }

        request
          .put('/orders/1')
          .send(updatedOrderDetails)
          .expect('Content-Type', /json/)
          .expect(200)
          .then(async () => {
            const updatedOrder = await db.orders.find(1)

            expect({
              ...updatedOrder,
              date: mockDate,
              products: mockOrderProducts,
            }).toEqual({
              id: mockOrders[0].id,
              email: updatedOrderDetails.email,
              date: mockDate,
              status: mockOrders[0].status,
              products: mockOrderProducts,
            })

            done()
          })
      })
    })

    describe('when cancelling order', () => {
      beforeEach(() => initOrders(mockOrders))

      it('restores inventory stock', async done => {
        const inventoryItemBeforeUpdate = await db.inventory.find(2)
        const orderQuantity = 3
        const updatedOrderDetails = {
          status: 'CANCELLED',
        }

        request
          .put('/orders/2')
          .send(updatedOrderDetails)
          .expect('Content-Type', /json/)
          .expect(200)
          .then(async () => {
            const inventoryItemAfterUpdate = await db.inventory.find(
              2,
            )

            expect(
              inventoryItemBeforeUpdate.quantity_remaining,
            ).toEqual(
              inventoryItemAfterUpdate.quantity_remaining -
                orderQuantity,
            )

            done()
          })
      })
    })

    describe('when resuming order', () => {
      beforeEach(() => initOrders(mockOrders))

      it('updates inventory stock', async done => {
        const inventoryItemBeforeUpdate = await db.inventory.find(2)
        const orderQuantity = 2
        const updatedOrderDetails = {
          status: 'IN_PROGRESS',
        }

        request
          .put('/orders/3')
          .send(updatedOrderDetails)
          .expect('Content-Type', /json/)
          .expect(200)
          .then(async () => {
            const inventoryItemAfterUpdate = await db.inventory.find(
              2,
            )

            expect(
              inventoryItemBeforeUpdate.quantity_remaining -
                orderQuantity,
            ).toEqual(inventoryItemAfterUpdate.quantity_remaining)

            done()
          })
      })
    })
  })
})
