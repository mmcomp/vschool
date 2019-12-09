'use strict'

const Page = require('../models/page.model')

class PageController {
  static async load (request, reply) {
    const page = await Page.query().where('id', request.params.id).first()
    if(page && page.page) {
      reply.send(page.page)
    }else {
      reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "صفحه مورد نظر پیدا نشد"
      })
    }
  }
}

module.exports = PageController