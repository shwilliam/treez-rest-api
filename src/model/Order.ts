import {IInventory} from './Inventory'

interface IProduct {
  id: string,
  quanity: number,
}

interface IOrder {
  id: string,
  products: IInventory[],
  email: string,
  date: Date,
  status: 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED',
}

interface IOrderPayload {
  products: string,
  email: string
}

type TProductOrderPayload = [string, number][]

export {IOrder, IProduct, IOrderPayload, TProductOrderPayload}
