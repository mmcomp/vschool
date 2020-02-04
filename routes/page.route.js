'use strict'

const PageController = require('../controllers/page.controller')

async function routes (fastify, options) {
    fastify.get('/api/page/:id', PageController.load)
}

module.exports = routes