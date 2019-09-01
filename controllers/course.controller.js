'use strict'

const Course = require('../models/course.model')
const Chapter = require('../models/chapter.model')

class CourseController {
  static async index (request, reply) {
    const courses = await Course.query().select('id', 'name', 'description')
    reply.send(courses)
  }
  
  static async courseOfEducationLevel (request, reply) {
    const courses = await Course.query().where('education_level', request.params.education_level).select('id', 'name', 'description')
    reply.send(courses)
  }

  static async chapters (request, reply) {
    const courses = await Course.query().eager('[ chapters ]').omit(['teacher_id']).omit(Chapter, ['icon', 'courses_id'])
    reply.send(courses)
  }
  
  static async courseChapters (request, reply) {
    const course = await Course.query().where('id', request.params.courses_id).eager('[ chapters ]').omit(['teacher_id']).omit(Chapter, ['icon', 'courses_id']).first()
    reply.send(course)
  }
}

module.exports = CourseController