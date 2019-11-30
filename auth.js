const fp = require("fastify-plugin")
const User = require('./models/user.model.js')
module.exports = fp(async function(fastify, opts) {
  fastify.register(require("fastify-jwt"), {
    secret: "supersecret"
  })

  fastify.decorate("authenticate", async function(request, reply) {
    try {
      await request.jwtVerify()
      User.query().where('id', request.user.id).update({
        last_activity: new Date()
      }).then(res => {

      }).catch(e => {
        
      })
    } catch (err) {
      reply.send(err)
    }
  })
})