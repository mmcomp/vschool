'use strict'

const DuelController = require('../controllers/duel.controller')


async function routes(fastify, options) {
    fastify.get('/api/duel/start', {
        preValidation: [fastify.authenticate]
    }, DuelController.start)

    fastify.post('/api/duel/setcourse', {
        schema: {
            body: {
                type: 'object',
                required: ['duel_id', 'course_id'],
                properties: {
                    duel_id: {
                        type: 'integer',
                        min: 1
                    },
                    course_id: {
                        type: 'integer',
                        min: 0
                    },
                    answers: {
                        type: 'object'
                    }
                }
            }
        },
        preValidation: [fastify.authenticate]
    }, DuelController.setCourse)

    fastify.get('/api/duel/list', {
        preValidation: [fastify.authenticate]
    }, DuelController.list)

    fastify.get('/api/duel/match/:id', {
        preValidation: [fastify.authenticate]
    }, DuelController.match)

    fastify.get('/api/duel', {
        preValidation: [fastify.authenticate]
    }, DuelController.index)
}

module.exports = routes