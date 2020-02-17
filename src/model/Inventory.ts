interface IInventoryBase {
  name: string,
  description?: string,
  price: number,
}

interface IInventory extends IInventoryBase {
  id: string,
  quantity_remaining: number,
}

interface IInventoryOrder extends IInventoryBase {
  id: string,
  quantity: number,
}

interface IAddInventoryPayload extends IInventoryBase {
  id?: string,
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
