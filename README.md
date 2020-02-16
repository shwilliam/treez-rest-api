# Treez Rest API

## Setup

The following steps will walk you through setting up a PostgreSQL database and tables required for this service.

1. Ensure you have `postgresql` installed and running on your machine. If you are using MacOS with Homebrew you can get set up by running the following:

```bash
brew install postgresql
brew services start postgresql
```

2. Open up the PostgreSQL shell and create a user with permissions to create a database.

```bash
psql postgres
```

```sql
CREATE ROLE rest_user WITH LOGIN PASSWORD 'password';
ALTER ROLE rest_user CREATEDB;
```

3. Again, connect to the PostgreSQL shell, this time with the newly created user.

```bash
psql -d postgres -U rest_user
```

4. Create a new database and connect to it.

```sql
CREATE DATABASE treez_api;
\c treez_api;
```

5. Run the SQL queries in `/init.sql` to set up the necessary tables.

6. Modify the environment variables in `/.env` to match your development environment.

## Development

To start the development server:

1. Install dependencies (`npm i`)

2. Build TypeScript files to `/dist` (`npm run build`)

3. Run npm `start` script (`npm start`)

## Test

Assuming you have installed project dependencies and built TS files to `/dist`, you can run the tests with the npm script `test` (`npm test`).
