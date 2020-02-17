import {IInventory, IInventoryOrder} from './Inventory'

interface IOrderBase {
  id: string,
  email: string,
  date: Date,
  status: TStatus,
}

interface IOrder extends IOrderBase {
  products: IInventory[],
}

interface IOrderDetails extends IOrderBase {
  product_id: string,
  quantity: number,
}

interface IOrderSummary extends IOrderBase {
  products: IInventoryOrder[],
}

interface IOrderPayload {
  products: string,
  email: string
}

interface IOrderUpdatePayload {
  id: string,
  products?: TProductOrderPayload,
  email?: string,
  status?: TStatus
}

type TStatus = 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED'
type TProductQuantities = [string, number]
type TProductOrderPayload = TProductQuantities[]

export {
  IOrder,
  IOrderDetails,
  IOrderSummary,
  IOrderPayload,
  IOrderUpdatePayload,
  TProductOrderPayload,
  TProductQuantities,
}
