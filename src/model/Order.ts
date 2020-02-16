import {IInventory, IInventoryOrder} from './Inventory'

interface IProduct {
  id: string,
  quanity: number,
}

interface IOrder {
  id: string,
  products: IInventory[],
  email: string,
  date: Date,
  status: TStatus,
}

interface IOrderDetails {
  id: string,
  product_id: string,
  quantity: number,
}

interface IOrderSummary {
  id: string,
  products: IInventoryOrder[],
  email: string,
  date: Date,
  status: TStatus,
}

interface IOrderPayload {
  products: string,
  email: string
}

interface IOrderUpdatePayload {
  id: string,
  products: TProductOrderPayload,
  email: string,
  status: TStatus
}

type TStatus = 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED'
type TProductOrderPayload = [string, number][]

export {
  IProduct,
  IOrder,
  IOrderDetails,
  IOrderSummary,
  IOrderPayload,
  TProductOrderPayload,
  IOrderUpdatePayload,
}
