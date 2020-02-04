'use strict'

const SubscriptionController = require('../controllers/subscription.controller')

async function routes(fastify, options) {
    fastify.post('/api/subscription/add', {
        schema: {
            body: {
                type: 'object',
                required: ['type'],
                properties: {
                    type: {
                        type: 'string',
                        enum: ['monthly_price', 'half_annual_price', 'annually_price']
                    },
                    course: {
                        type: 'integer',
                        minimum: 1
                    }
                }
            }
        },
        preValidation: [fastify.authenticate]
    }, SubscriptionController.add)
    fastify.get('/api/subscription/history', {
        preValidation: [fastify.authenticate]
    }, SubscriptionController.history)
    fastify.get('/api/subscription', {
        preValidation: [fastify.authenticate]
    }, SubscriptionController.load)
}

module.exports = routes