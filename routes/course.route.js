'use strict'

const CourseController = require('../controllers/course.controller')

async function routes (fastify, options) {
  fastify.get('/api/course/chapters/:courses_id', {
    preValidation: [fastify.authenticate]
  }, CourseController.courseChapters)

  fastify.get('/api/course/chapters', {
    preValidation: [fastify.authenticate]
  }, CourseController.chapters)

  fastify.get('/api/course/map/:courses_id', {
    preValidation: [fastify.authenticate]
  }, CourseController.map)


  fastify.get('/api/course/preview/:courses_id', CourseController.preview)

  fastify.get('/api/course/:education_level', {
    preValidation: [fastify.authenticate]
  }, CourseController.courseOfEducationLevel)

  fastify.get('/api/course', {
    preValidation: [fastify.authenticate]
  }, CourseController.index)
}

module.exports = routes