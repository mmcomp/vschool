'use strict'

const UserController = require('../controllers/user.controller')
const OtpController = require('../controllers/otp.controller')

async function routes (fastify, options) {
  fastify.get('/api/test', async function(request, reply){
      reply.send('salam')
  })

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

  fastify.post('/api/introduce', {
    schema: {
      body: {
        type: 'object',
        required: ['fname', 'lname', 'avatar'],
        properties: {
          fname: {
            type: 'string',
            minLength: 3
          },
          lname: {
            type: 'string',
            minLength: 5
          },
          avatar: {
            type: 'number',
            minimum: 1
          },
        }
      }
    },
    preValidation: [fastify.authenticate]
  }, UserController.introduce)

  fastify.get('/api/otp/:mobile' , {
    preValidation: [fastify.authenticate]
  } , OtpController.requestOtp)

  fastify.get('/api/user/pass_page/:pages_id', {
    preValidation: [fastify.authenticate]
  }, UserController.passPage)

  fastify.post('/api/pushid', {
    schema: {
      body: {
        type: 'object',
        required: ['push_id'],
        properties: {
          push_id: {
            type: 'string',
            minLength: 5
          }
        }
      }
    },
    preValidation: [fastify.authenticate]
  }, UserController.setPushId)

  fastify.get('/api/contacts/add/:users_id', {
    preValidation: [fastify.authenticate]
  }, UserController.addFriend)

  fastify.get('/api/contacts/list', {
    preValidation: [fastify.authenticate]
  }, UserController.list)

  fastify.post('/api/contacts/add', {
    schema: {
      body: {
        type: 'object',
        required: ['contacts'],
        properties: {
          contacts: {
            type: 'array',
            minLength: 1
          }
        }
      }
    },
    preValidation: [fastify.authenticate]
  }, UserController.addFriends)

  fastify.post('/api/contacts', {
    schema: {
      body: {
        type: 'object',
        required: ['contacts'],
        properties: {
          contacts: {
            type: 'array',
            minLength: 1
          }
        }
      }
    },
    preValidation: [fastify.authenticate]
  }, UserController.contacts)

  fastify.get('/api/push', UserController.pushTest)
}

module.exports = routes