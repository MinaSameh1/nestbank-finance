## Description

Backend built using [Nest](https://github.com/nestjs/nest), Typescript and SQL.

Has swagger built in for documentation.

## Installation

Install deps
```bash
$ yarn
```

Copy .env 
```bash
$ cp .env.example .env
```

Run database
```
docker compose up -d database
```

Run app
```
yarn start
```

Then go to http://localhost:8000/docs for swagger
## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e test
$ yarn run test:e2e
```
