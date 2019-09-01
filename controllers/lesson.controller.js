'use strict'

const Chapter = require('../models/chapter.model')
const Course = require('../models/course.model')
const Lesson = require('../models/lesson.model')
const Page = require('../models/page.model')
const Question = require('../models/question.model')

class LessonController {
  static async index (request, reply) {
    const lessons = await Lesson.query().eager('[ chapter, chapter.[ course ], questions ]').omit(['chapters_id']).omit(Chapter, ['courses_id', 'icon']).omit(Course, ['teacher_id']).omit(Question, ['lessons_id', 'pages_id'])
    reply.send(lessons)
  }

  static async pages (request, reply) {
    const lessons = await Lesson.query().eager('[ chapter, pages, chapter.[ course ], pages.[ question ], questions ]').omit(['chapters_id']).omit(Chapter, ['courses_id', 'icon']).omit(Course, ['teacher_id']).omit(Page, ['lessons_id', 'created_at', 'updated_at']).omit(Question, ['lessons_id', 'pages_id'])
    reply.send(lessons)
  }
  
  static async lessonPages (request, reply) {
    const lesson = await Lesson.query().where('id', request.params.lessons_id).eager('[ chapter, pages, chapter.[ course ], pages.[ question ], questions ]').omit(['chapters_id']).omit(Chapter, ['courses_id', 'icon']).omit(Course, ['teacher_id']).omit(Page, ['lessons_id', 'created_at', 'updated_at']).omit(Question, ['lessons_id', 'pages_id']).first()
    reply.send(lesson)
  }
}

module.exports = LessonController