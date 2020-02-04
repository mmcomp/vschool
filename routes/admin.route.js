'use strict'

async function routes (fastify, options) {
    fastify.get('/', (request, reply) => {
        reply.render('index.pug');
    });
}

module.exports = routes