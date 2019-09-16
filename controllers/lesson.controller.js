'use strict'

const Chapter = require('../models/chapter.model')
const Course = require('../models/course.model')
const Lesson = require('../models/lesson.model')
// const Page = require('../models/page.model')
// const Question = require('../models/question.model')

class LessonController {
  static async index (request, reply) {
    const courses = await Course.query().where('education_level', request.user.education_level).pluck('id') 
    const chapters = await Chapter.query().whereIn('courses_id', courses).pluck('id')
    const lessons = await Lesson.query().whereIn('chapters_id', chapters).eager('[ chapter(defaultSelects), chapter(defaultSelects).[ course(defaultSelects) ], questions(defaultSelects) ]')
    reply.send(lessons)
  }

  static async pages (request, reply) {
    const courses = await Course.query().where('education_level', request.user.education_level).pluck('id') 
    const chapters = await Chapter.query().whereIn('courses_id', courses).pluck('id')
    const lessons = await Lesson.query().whereIn('chapters_id', chapters).eager('[ chapter(defaultSelects), chapter(defaultSelects).[ course(defaultSelects) ], questions(defaultSelects), pages(defaultSelects, orderByPageOrder) ]')
    reply.send(lessons)
  }
  
  static async lessonPages (request, reply) {
    const courses = await Course.query().where('education_level', request.user.education_level).pluck('id') 
    const chapters = await Chapter.query().whereIn('courses_id', courses).pluck('id')
    const lesson = await Lesson.query().whereIn('chapters_id', chapters).where('id', request.params.lessons_id).eager('[ chapter(defaultSelects), chapter(defaultSelects).[ course(defaultSelects) ], questions(defaultSelects), pages(defaultSelects, orderByPageOrder) ]').first()
    reply.send(lesson)
  }
}

module.exports = LessonController