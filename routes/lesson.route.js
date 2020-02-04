'use strict'

const LessonController = require('../controllers/lesson.controller')


async function routes (fastify, options) {
    fastify.get('/api/lesson/pages/:lessons_id', {
    preValidation: [fastify.authenticate]
    }, LessonController.lessonPages)

    fastify.get('/api/lesson/pages', {
    preValidation: [fastify.authenticate]
    }, LessonController.pages)

    fastify.get('/api/lesson', {
    preValidation: [fastify.authenticate]
    }, LessonController.index)
}

module.exports = routes