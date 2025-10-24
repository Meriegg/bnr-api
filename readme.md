# BNR API

A simple API which servers the BNR (National Bank of Romania) exchange rates for a specific date.

## Endpoints

- `/rate/:date` which will return the exchange rates for the given date.
- `/what` which will return the API documentation.

## Production URL

Instead of self hosting, you can use the following URL for a quick integration:

https://bnr.simpluconta.ro/rate/[:date]

## Self hosting

To self host you will need a postgres database.

You need to install the dependencies:

```bash
npm install
```

Then build the project:

```bash
npm run build
```

Then you need to create a `.env` file with the following content:

```dotenv
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]"
```

Then you can apply the migrations to your database:

```bash
npx drizzle-kit migrate
```

Then you can start to load in the exchange rates:

```bash
npm run load
```

And then you can start the server:

```bash
npm run start
```
