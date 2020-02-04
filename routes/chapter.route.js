'use strict'

const ChapterController = require('../controllers/chapter.controller')


async function routes (fastify, options) {
  fastify.get('/api/chapter/lessons/:chapters_id', {
    preValidation: [fastify.authenticate]
  }, ChapterController.chapterLessons)

  fastify.get('/api/chapter/lessons', {
    preValidation: [fastify.authenticate]
  }, ChapterController.lessons)

  fastify.get('/api/chapter/exam/:chapters_id', {
    preValidation: [fastify.authenticate]
  }, ChapterController.exam)
  
  fastify.get('/api/chapter', {
    preValidation: [fastify.authenticate]
  }, ChapterController.index)
}

module.exports = routes