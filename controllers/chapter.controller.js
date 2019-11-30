'use strict'

const Chapter = require('../models/chapter.model')
const Course = require('../models/course.model')
// const Lesson = require('../models/lesson.model')

class ChapterController {
  static async index (request, reply) {
    const courses = await Course.query().where('education_level', request.user.education_level).pluck('id') 
    const chapters = await Chapter.query().select(['id', 'name', 'description']).whereIn('courses_id', courses).eager('[ course(defaultSelects) ]')
    reply.send(chapters)
  }

  static async lessons (request, reply) {
    const courses = await Course.query().where('education_level', request.user.education_level).pluck('id') 
    const chapters = await Chapter.query().select(['id', 'name', 'description']).whereIn('courses_id', courses).eager('[ course(defaultSelects), lessons(defaultSelects, orderByLessonOrder) ]')
    reply.send(chapters)
  }
  
  static async chapterLessons (request, reply) {
    const courses = await Course.query().where('education_level', request.user.education_level).pluck('id') 
    const chapter = await Chapter.query().select(['id', 'name', 'description']).whereIn('courses_id', courses).where('id', request.params.chapters_id).eager('[ course(defaultSelects), lessons(defaultSelects, orderByLessonOrder) ]').first()
    reply.send(chapter)
  }
}

module.exports = ChapterController