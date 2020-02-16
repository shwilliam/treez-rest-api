CREATE TYPE order_status AS ENUM ('IN_PROGRESS', 'COMPLETE', 'CANCELLED');

CREATE TABLE inventory (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity_remaining INTEGER NOT NULL CONSTRAINT in_stock CHECK (quantity_remaining >= 0)
);

CREATE TABLE orders (
  ID SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  status order_status DEFAULT 'IN_PROGRESS'
);

CREATE TABLE product_orders (
  ID SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders (ID) NOT NULL,
  product_id INTEGER REFERENCES inventory (ID) NOT NULL,
  quantity INTEGER NOT NULL
);
