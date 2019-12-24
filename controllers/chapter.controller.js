'use strict'

const Chapter = require('../models/chapter.model')
// const Course = require('../models/course.model')
// const User = require('../models/user.model')
const Question = require('../models/question.model')
const Page = require('../models/page.model')
const Lesson = require('../models/lesson.model')
const Setting = require('../models/setting.model')

class ChapterController {
  static async index (request, reply) {
    // const courses = await Course.query().where('education_level', request.user.education_level).pluck('id') 
    const chapters = await Chapter.query().select(['id', 'name', 'description'])/*.whereIn('courses_id', courses).eager('[ course(defaultSelects) ]')*/
    reply.send(chapters)
  }

  static async lessons (request, reply) {
    // const courses = await Course.query().where('education_level', request.user.education_level).pluck('id') 
    const chapters = await Chapter.query().select(['id', 'name', 'description'])/*.whereIn('courses_id', courses)*/.eager('[ course(defaultSelects), lessons(defaultSelects, orderByLessonOrder) ]')
    reply.send(chapters)
  }
  
  static async exam (request, reply) {
    let advance = 3
    const advanceSetting = await Setting.query().where('key', 'chapter_exam_advance').first()
    if(advanceSetting && !isNaN(parseInt(advanceSetting.value, 10))) {
      advance = parseInt(advanceSetting.value, 10)
    }
    const lessons = await Lesson.query().where('chapters_id', request.params.chapters_id).pluck('id')
    const pages = await Page.query().whereIn('lessons_id', lessons).pluck('id')
    const questions = await Question.query().select(['id', 'question', 'question_type', 'solution', 'choices', 'answer']).where((builder) => {
      builder.where('chapters_id', request.params.chapters_id).orWhereIn('lessons_id', lessons).orWhereIn('pages_id', pages)
    }).where('question_type', '!=', 'answer').limit(20)
    reply.send({
      questions: questions,
      advance,
    })
  }

  static async chapterLessons (request, reply) {
    // const courses = await Course.query().where('education_level', request.user.education_level).pluck('id') 
    const chapter = await Chapter.query().select(['id', 'name', 'description'])/*.whereIn('courses_id', courses)*/.where('id', request.params.chapters_id)//.eager('[ lessons(defaultSelects, orderByLessonOrder) ]').first()
    reply.send(chapter)
  }
}

module.exports = ChapterController