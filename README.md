# Adonisjs Boilerplate

Learn adonisjs from [oficial documentation](https://docs.adonisjs.com/).

### Introduction

- This is the boilerplate for the adonisjs project with swagger implemented

#### This boilerplate contains the following modules:

- Authentication
- Authorization
- Swagger
- Logger
- Web Socket
- Cron jobs
- Redis

### Prerequisites

| **Plugin** | **Version** |
| ---------- | ----------- |
| Node       | ^20.11.1    |

### Installation

#### Install required packages of the project

```shell
npm install
```

#### Setting up the .env file

#### Run the migrations

```shell
node ace migration:run
```

#### Run the seeders (Optional)

```shell
node ace db:seed
```

### Run Project

#### For Development

```shell
npm run dev
```

#### For Production

```shell
npm run build
```

#### Generate a production build and start the server using pm2.

1. Make sure you have the updated .env file for production
2. Run the following command:

```shell
npm run deploy
```
3. It performs the following steps:
    1. Generate a build for production
    2. Copy .env file to build folder
    3. Start the server using pm2 tool.

#### If you use another tool, replace pm2 with the tool name in scripts section of the package.json file.

**HAPPY CODING :+1: :computer:**
