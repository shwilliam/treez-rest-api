const {request} = require('./config')
const {
  clearOrders,
  clearInventory,
  initStockedInventory,
  formatMonetaryDecimal,
  sortByID,
  mockInventory,
} = require('./utils')

const containsSameProducts = arr => res =>
  res.body.length === arr.length &&
  res.body.every(product => arr.includes(product))

describe('/inventories', () => {
  describe('GET', () => {
    beforeEach(async () => {
      await clearOrders()
      await clearInventory()
    })

    describe('when inventory stocked', () => {
      beforeEach(() => {
        initStockedInventory(mockInventory)
      })

      it('returns array of products', done => {
        request
          .get('/inventories')
          .expect('Content-Type', /json/)
          .expect(res => {
            res.body = res.body.sort(sortByID)
          })
          .expect(
            containsSameProducts(
              mockInventory.map(product => ({
                ...product,
                price: formatMonetaryDecimal(product.price),
              })),
            ),
          )
          .expect(200, done)
      })
    })

    describe('when inventory is empty', () => {
      it('returns empty array', done => {
        request
          .get('/inventories')
          .expect('Content-Type', /json/)
          .expect(200, [], done)
      })
    })
  })

  describe('POST', () => {
    beforeEach(async () => {
      await clearOrders()
      await clearInventory()
    })

    describe('when passed valid params', () => {
      const newItem = {
        id: 1,
        name: 'Test name',
        description: 'Test desc',
        price: 40.52,
        quantity: 42,
      }

      it('returns new item with ID', done => {
        request
          .post('/inventories')
          .send(newItem)
          .expect('Content-Type', /json/)
          .expect(
            201,
            {
              ...newItem,
              price: formatMonetaryDecimal(newItem.price),
            },
            done,
          )
      })
    })
  })
})
