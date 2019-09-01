'use strict'

const Chapter = require('../models/chapter.model')
const Course = require('../models/course.model')
const Lesson = require('../models/lesson.model')

class ChapterController {
  static async index (request, reply) {
    const chapters = await Chapter.query().eager('[ course ]').omit(['icon', 'courses_id']).omit(Course, ['teacher_id'])
    reply.send(chapters)
  }

  static async lessons (request, reply) {
    const chapters = await Chapter.query().eager('[ course, lessons ]').omit(['icon', 'courses_id']).omit(Course, ['teacher_id']).omit(Lesson, ['chapters_id'])
    reply.send(chapters)
  }
  
  static async chapterLessons (request, reply) {
    const chapter = await Chapter.query().where('id', request.params.chapters_id).eager('[ course, lessons ]').omit(['icon', 'courses_id']).omit(Course, ['teacher_id']).first()
    reply.send(chapter)
  }
}

module.exports = ChapterController