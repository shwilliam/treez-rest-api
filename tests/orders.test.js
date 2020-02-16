const {request} = require('./config')
const {
  clearOrders,
  clearInventory,
  initStockedInventory,
  initOrders,
  sortByID,
  containsSameElements,
  mockInventory,
  mockOrders,
  mockOrderProducts,
  mockID,
  mockDate,
} = require('./utils')

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
          .expect(res => {
            res.body = res.body.sort(sortByID)
          })
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
          .then(res => {
            const createdID = res.body.id
            const createdDate = res.body.date

            request
              .get(`/orders/${createdID}`)
              .expect('Content-Type', /json/)
              .expect(res => {
                res.body.products = mockOrderProducts
              })
              .expect(
                200,
                {
                  id: createdID,
                  email: newOrder.email,
                  date: createdDate,
                  status: 'IN_PROGRESS',
                  products: mockOrderProducts,
                },
                done,
              )
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

      it('removes order from db', done => {
        request
          .delete('/orders/1')
          .expect(200)
          .then(() => {
            request.get('/orders/1').expect(200, null, done)
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
          .then(() => {
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
                  email: updatedOrderDetails.email,
                  date: mockDate,
                  status: mockOrders[0].status,
                  products: mockOrderProducts,
                },
                done,
              )
          })
      })

      it('updates new product quantities', () => {})
    })

    describe('when cancelling order', () => {
      it('updates order status and inventory', () => {})
    })

    describe('when resuming order', () => {
      it('updates order status and inventory', () => {})
    })
  })
})
