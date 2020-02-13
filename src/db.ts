import pgPromise, {IInitOptions, IDatabase, IMain} from 'pg-promise'
import Inventory from './controllers/inventory'
import Orders from './controllers/orders'

const {DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME} = process.env

const initOptions: IInitOptions<IExtensions> = {
  extend(obj: TExtendedProtocol) {
    obj.inventory = new Inventory(obj)
    obj.orders = new Orders(obj)
  }
}

const pgp: IMain = pgPromise(initOptions)

const db: TExtendedProtocol = pgp({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
})

interface IExtensions {
  inventory: Inventory,
  orders: Orders,
}

type TExtendedProtocol = IDatabase<IExtensions> & IExtensions

export {db}
