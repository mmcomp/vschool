'use strict'

require('dotenv').config()

const Knex = require('knex')
const { Model } = require('objection')
const path = require('path')

let dbConnection = null
try{
  dbConnection = JSON.parse(process.env.CONNECTION)
}catch(e){}

if(!dbConnection) {
  console.log('Database Connection config is not currect')
  console.log(process.env.CONNECTION)
  process.exit(1)
}

const knex = Knex({
  client: (process.env.CLIENT)?process.env.CLIENT:'mysql',
  useNullAsDefault: true,
  connection: dbConnection,
  pool: { min: 5, max: 30 }
});
Model.knex(knex);

const logger = (process.env.DEBUG && process.env.DEBUG=='true')?true:false
const fastify = require('fastify')({
  logger,
})

fastify.register(require('fastify-pug'), {views: 'views'})

fastify.register(require('fastify-url-data'))

fastify.register(require('./auth'))
fastify.register(require('./route'))

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/', 
})

const start = async () => {
  try {
    await fastify.listen((process.env.PORT)?process.env.PORT:3000, '0.0.0.0')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()