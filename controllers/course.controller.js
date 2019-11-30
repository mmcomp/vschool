'use strict'

const Course = require('../models/course.model')

class CourseController {
  static async index (request, reply) {
    const courses = await Course.query().select('id', 'name', 'description').where('education_level', request.user.education_level)
    reply.send(courses)
  }
  
  static async courseOfEducationLevel (request, reply) {
    const courses = await Course.query().where('education_level', request.user.education_level).select('id', 'name', 'description')
    reply.send(courses)
  }

  static async chapters (request, reply) {
    const courses = await Course.query().select(['id', 'name', 'description', 'duel_time']).eager('[ chapters(orderByChapterOrder, defaultSelects) ]').where('education_level', request.user.education_level)
    reply.send(courses)
  }
  
  static async courseChapters (request, reply) {
    const course = await Course.query().select(['id', 'name', 'description', 'duel_time']).where('id', request.params.courses_id).eager('[ chapters(orderByChapterOrder, defaultSelects) ]').where('education_level', request.user.education_level).first()
    reply.send(course)
  }
}

module.exports = CourseController