interface IOrder {
  ID: string,
  product_id: string,
  email: string,
  date: Date,
  status: 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED',
}

export {IOrder}
