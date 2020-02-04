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

fastify.register(require('fastify-cors'), { 
  origin: true,
})

fastify.register(require('fastify-pug'), {views: 'views'})

fastify.register(require('fastify-url-data'))

fastify.register(require('./auth'))
fastify.register(require('./routes/admin.route'))
fastify.register(require('./routes/chapter.route'))
fastify.register(require('./routes/course.route'))
fastify.register(require('./routes/duel.route'))
fastify.register(require('./routes/lesson.route'))
fastify.register(require('./routes/page.route'))
fastify.register(require('./routes/question.route'))
fastify.register(require('./routes/subscription.route'))
fastify.register(require('./routes/user.route'))

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/', 
})

fastify.register(require('fastify-ws'))
const WSController = require('./controllers/websocket.controller')
fastify.ready(err => {
  if (err) throw err
 
  console.log('Socket Server started.')
 
  fastify.ws
    .on('connection', (socket) => {
      const wsController = new WSController(socket, fastify)
      wsController.connect(socket, fastify).then(res=>{
        console.log('Exec WS Controller', res)
      }).catch(e => {
        console.log('Error WS Controller', e)
      })
    })
    // .on('connection', socket => {
    //   console.log('Client connected.')
 
    //   socket.on('message', msg => socket.send(msg)) 
 
    //   socket.on('close', () => console.log('Client disconnected.'))
    // })
})

const start = async () => {
  try {
    await fastify.listen((process.env.PORT)?process.env.PORT:3000, '0.0.0.0')
    require('./cronJobs')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()