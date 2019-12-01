'use strict'

const Course = require('../models/course.model')
const Chapter = require('../models/chapter.model')

class CourseController {
  static async index (request, reply) {
    const courses = await Course.query().select('id', 'name', 'description', 'education_level').where('published', 1)/*.where('education_level', request.user.education_level)*/
    reply.send(courses)
  }
  
  static async courseOfEducationLevel (request, reply) {
    const courses = await Course.query()/*.where('education_level', request.user.education_level)*/.select('id', 'name', 'description', 'education_level').where('published', 1)
    reply.send(courses)
  }

  static async chapters (request, reply) {
    const courses = await Course.query().select(['id', 'name', 'description', 'duel_time']).eager('[ chapters(orderByChapterOrder, defaultSelects) ]').where('education_level', request.user.education_level).where('published', 1)
    reply.send(courses)
  }
  
  static async courseChapters (request, reply) {
    // const course = await Course.query().select(['id', 'name', 'description', 'duel_time']).where('id', request.params.courses_id).where('education_level', request.user.education_level).eager('[ chapters(orderByChapterOrder, defaultSelects) ]').first()
    const course = await Course.query().where('published', 1).where('id', request.params.courses_id).first()
    if(!course) {
      reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: ""
      })
    }
    const chapters = await Chapter.query().select(['id', 'name', 'description']).where('courses_id', course.id)
    reply.send(chapters)
  }
}

module.exports = CourseController