const {request} = require('./config')
const {
  clearOrders,
  clearInventory,
  initStockedInventory,
  formatMonetaryDecimal,
  containsSameElements,
  mockInventory,
  mockID,
} = require('./utils')
const {db} = require('../dist/db')

describe('/inventories', () => {
  describe('GET', () => {
    beforeEach(async () => {
      await clearOrders()
      return clearInventory()
    })

    describe('when inventory is empty', () => {
      it('returns empty array', done => {
        request
          .get('/inventories')
          .expect('Content-Type', /json/)
          .expect(200, [], done)
      })
    })

    describe('when inventory stocked', () => {
      beforeEach(() => initStockedInventory(mockInventory))

      it('returns array of products', done => {
        request
          .get('/inventories')
          .expect('Content-Type', /json/)
          .expect(
            containsSameElements(
              mockInventory.map(product => ({
                ...product,
                price: formatMonetaryDecimal(product.price),
              })),
            ),
          )
          .expect(200, done)
      })
    })
  })

  describe('POST', () => {
    beforeEach(async () => {
      await clearOrders()
      return clearInventory()
    })

    describe('when passed valid params', () => {
      const newItem = {
        name: 'Test name',
        description: 'Test desc',
        price: 40.52,
        quantity_remaining: 42,
      }

      it('returns created item', done => {
        request
          .post('/inventories')
          .send(newItem)
          .expect('Content-Type', /json/)
          .expect(res => {
            res.body.id = mockID
          })
          .expect(
            201,
            {
              ...newItem,
              id: mockID,
              price: formatMonetaryDecimal(newItem.price),
            },
            done,
          )
      })

      it('inserts item into inventory db', async done => {
        request
          .post('/inventories')
          .send(newItem)
          .expect('Content-Type', /json/)
          .expect(201)
          .then(async res => {
            const createdID = res.body.id
            const createdItem = await db.inventory.find(createdID)

            expect(createdItem).toEqual({
              ...newItem,
              id: createdID,
              price: formatMonetaryDecimal(newItem.price),
            })

            done()
          })
      })
    })
  })
})

describe('/inventories/:id', () => {
  beforeEach(async () => {
    await clearOrders()
    return clearInventory()
  })

  describe('GET', () => {
    describe('when item exists', () => {
      beforeEach(() => initStockedInventory(mockInventory))

      it('returns item details', done => {
        request
          .get('/inventories/1')
          .expect('Content-Type', /json/)
          .expect(
            200,
            {
              ...mockInventory[0],
              price: formatMonetaryDecimal(mockInventory[0].price),
            },
            done,
          )
      })
    })
  })

  describe('DELETE', () => {
    describe('when item exists', () => {
      beforeEach(() => initStockedInventory(mockInventory))

      it('removes item from db', done => {
        request
          .delete('/inventories/1')
          .expect(200)
          .then(async () => {
            const inventoryItem = await db.inventory.find(1)

            expect(inventoryItem).toBeNull()

            done()
          })
      })
    })
  })

  describe('PUT', () => {
    describe('when item exists', () => {
      beforeEach(() => initStockedInventory(mockInventory))

      it('updates item', done => {
        const updatedItemDetails = {
          name: 'New name',
          description: 'New desc',
          price: 99,
          quantity_remaining: 99,
        }

        request
          .put('/inventories/1')
          .send(updatedItemDetails)
          .expect('Content-Type', /json/)
          .expect(200)
          .then(async () => {
            const updatedItem = await db.inventory.find(1)

            expect(updatedItem).toEqual({
              ...updatedItemDetails,
              id: 1,
              price: formatMonetaryDecimal(updatedItemDetails.price),
            })

            done()
          })
      })
    })
  })
})
