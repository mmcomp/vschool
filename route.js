'use strict'

const User = require('./models/user.model.js')
const UserController = require('./controllers/user.controller')
const OtpController = require('./controllers/otp.controller')

async function routes (fastify, options) {
  // Open
  fastify.post('/api/signin', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            minLength: 3
          },
          password: {
            type: 'string',
            minLength: 3
          }
        }
      }
    }
  }, async (request, reply) => {
    const {email, password} = request.body
    const user = await User.query().where('email', email).first()
    if(user && await user.verify(password)) {
      const token = fastify.jwt.sign(user.toJSON())
      reply.code(202).send({
        name: user.fname + ' ' + user.lname,
        email: user.email,
        mobile: user.mobile,
        token
      })  
    }else {
      reply.code(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "ایمیل یا رمز عبور اشتباه است"
      })
    }
  })

  fastify.post('/api/signup', async (request, reply) => {
    const user = await User.createGuestUser()

    const token = fastify.jwt.sign(user.toJSON())
    reply.code(201).send({
      key: `${user.id}|${user.password}`,
      token
    })
  })

  fastify.post('/api/token', {
    schema: {
      body: {
        type: 'object',
        required: ['key'],
        properties: {
          key: {
            type: 'string',
            minLength: 10
          }
        }
      }
    }
  },async (request, reply) => {
    const { key } = request.body
    const user_id = parseInt(key.split('|')[0], 10)
    const user = await User.query().where('id', user_id).first()

    if(!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "کلید مورد نظر پیدا نشد"
      })
    }
    const token = fastify.jwt.sign(user.toJSON())
    reply.code(200).send({
      token
    })
  })
  // Auth
  fastify.get('/api/', {
    preValidation: [fastify.authenticate]
  }, UserController.test)

  // User
  fastify.post('/api/profile', {
    schema: {
      body: {
        type: 'object',
        required: ['otp'],
        properties: {
          mobile: {
            type: 'string',
            minLength: 5
          }
        }
      }
    },
    preValidation: [fastify.authenticate]
  }, UserController.profile)

  fastify.get('/api/otp/:mobile', {
    preValidation: [fastify.authenticate]
  }, OtpController.requestOtp)

  // Admin
  fastify.get('/', (request, reply) => {
    reply.render('index.pug');
  });

  // Others
  fastify.get('/*', async (req, reply) => {
    const urlData = req.urlData()
    console.log('path', urlData.path) // '/foo'
    console.log('query', urlData.query) // 'a=b&c=d'
    console.log('host', urlData.host) // '127.0.0.1'
    console.log('port', urlData.port) // 8080
  
    reply.send({
      status: 1,
      messages: [{
        code: 'DummyError',
        message: 'خظای احمقانه'
      }],
      data: {}
    })
  })

  fastify.post('/*', async (req, reply) => {
    const urlData = req.urlData()
    console.log('path', urlData.path) // '/foo'
    console.log('query', urlData.query) // 'a=b&c=d'
    console.log('host', urlData.host) // '127.0.0.1'
    console.log('port', urlData.port) // 8080
    console.log('body', req.body)
  
    reply.send({
      status: 1,
      messages: [{
        code: 'DummyError',
        message: 'خظای احمقانه'
      }],
      data: {}
    })
  })
}

module.exports = routes