'use strict'

const Page = require('../models/page.model')

class PageController {
  static async load (request, reply) {
    const page = await Page.query().where('id', request.params.id).first()
    if(page && page.page) {
      let thePage = page.page
      for(let i = 0;i < thePage.data.length;i++) {
        if(thePage.data[i].type == 'image') {
          thePage.data[i].data = `/page_images/page_${page.id}/${thePage.data[i].data}`
        }
      }
      reply.send(thePage)
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