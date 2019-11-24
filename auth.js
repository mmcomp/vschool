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
      if(!request.user.education_level) {
        const user = await User.query().select('*').where('id', request.user.id).first()
        request.user.education_level = user.education_level
      }
      console.log(request.user)
    } catch (err) {
      reply.send(err)
    }
  })
})