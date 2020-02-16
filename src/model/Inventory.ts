interface IInventory {
  id: string,
  name: string,
  description?: string,
  price: number,
  quantity_remaining: number,
}

interface IInventoryOrder {
  id: string,
  name: string,
  description?: string,
  price: number,
  quantity: number,
}

interface IAddInventoryPayload {
  id?: string,
  name: string,
  description?: string,
  price: number,
  quantity_remaining: number,
}

interface IInventoryUpdatePayload {
  id: string,
  name?: string,
  description?: string,
  price?: number,
  quantity_remaining?: number,
}

export {IInventory, IInventoryOrder, IAddInventoryPayload, IInventoryUpdatePayload}
