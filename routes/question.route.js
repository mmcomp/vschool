'use strict'

const QuestionController = require('../controllers/question.controller')

async function routes (fastify, options) {
    fastify.get('/api/question/:id', QuestionController.load)
}

module.exports = routes