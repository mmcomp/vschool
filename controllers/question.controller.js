'use strict'

const Question = require('../models/question.model')

class QuestionController {
  static async load (request, reply) {
    const question = await Question.query().select(['id', 'question', 'question_type', 'answer', 'choices', 'score', 'solution']).where('id', request.params.id)
    reply.send(question)
  }
}

module.exports = QuestionController