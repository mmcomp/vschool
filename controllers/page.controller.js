'use strict'

const Page = require('../models/page.model')

class PageController {
  static async load (request, reply) {
    const page = await Page.query()/*.select(['id', 'question', 'question_type', 'answer', 'choices', 'score', 'solution'])*/.where('id', request.params.id).first()
    reply.send((page && page.page)?page.page:null)
  }
}

module.exports = PageController