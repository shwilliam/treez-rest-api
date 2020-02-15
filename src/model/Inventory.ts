interface IInventory {
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
  quantity: number,
}

interface IInventoryUpdatePayload {
  id: string,
  name?: string,
  description?: string,
  price?: number,
  quantity?: number,
}

export {IInventory, IAddInventoryPayload, IInventoryUpdatePayload}
