let sockets = []

module.exports = class {
  constructor(socket, fastify) {
    this.socket = socket
    this.fastify = fastify
  }

  async connect () {
    const {socket, fastify} = this
    const that = this
    socket.id = sockets.length
    console.log('sockets lenght before', sockets.length)
    sockets.push(socket)
    console.log('sockets lenght after', sockets.length)
    console.log('Client connected.')
    socket.on('message', msg => {
      try{
        msg = JSON.parse(msg)
      }catch(e) {
        socket.send(`Echo: ${msg}`)
        return false
      }
      console.log('msg')
      console.log(msg)
      if(!msg.type) {
        socket.send(JSON.stringify({
          statusCode: 406,
          error: "type is not sent",
          message: "نوع پیام می بایست مشخص شود"
        }))
        return false
      }
      if(!socket.user) {
        if(msg.type=="login"){
          if(!msg.token) {
            socket.send(JSON.stringify({
              statusCode: 406,
              error: "token is not sent",
              message: "توکن می بایست ارسال شود"
            }))
            return false
          }
          fastify.jwt.verify(msg.token, (err, decoded) => {
            if (err) {
              socket.send(JSON.stringify({
                statusCode: 400,
                error: "token is not valid",
                message: "توکن می بایست صحیح باشد"
              }))
              return false
            }
            // console.log('Token Data')
            // console.log(decoded)
            socket.user = decoded
            socket.send(JSON.stringify({
              statusCode: 200,
              error: "",
              message: ""
            }))
            return
          })
        }else {
          socket.send(JSON.stringify({
            statusCode: 403,
            error: "Not logged in",
            message: "ورود انجام نشده"
          }))
          return false
        }
      }else {
        socket.send(JSON.stringify({
          statusCode: 200,
          error: "",
          message: ""
        }))
      }
    })
    socket.on('close', () => {
      console.log('Client disconnected.')
      that.disconnect()
    })
  }

  async disconnect () {
    const {socket} = this
    console.log('sockets lenght before', sockets.length)
    sockets.splice(socket.id, 1)
    console.log('sockets lenght after', sockets.length)
  }
}