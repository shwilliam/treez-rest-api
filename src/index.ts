import './lib/env'
import {app} from './app'
import {getInventory, createInventoryItem} from './services/inventory'
import {getOrders} from './services/orders'

app
  .route('/inventories')
  .get(getInventory)
  .post(createInventoryItem)

app
  .route('/orders')
  .get(getOrders)

app.listen(process.env.PORT, () => {
  console.log(`Running on port ${process.env.PORT}`)
})

export default app
