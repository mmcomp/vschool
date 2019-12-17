'use strict'

const Course = require('../models/course.model')
const Chapter = require('../models/chapter.model')
const UserChapter = require('../models/user_chapter.model')
const UserLesson = require('../models/user_lesson.model')

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

  static async map (request, reply) {
    let chapters = await Chapter.query().select(['id', 'name', 'icon', 'description']).where('courses_id', request.params.courses_id).eager('lessons(orderByLessonOrder, defaultSelects)').orderBy('chapter_order')
    let chapterIds = []
    let lessonIds = []
    for(let chapter of chapters) {
      chapterIds.push(chapter.id)
      for(let lesson of chapter.lessons) {
        lessonIds.push(lesson.id)
      }
    }
    const userChapters = await UserChapter.query().whereIn('chapters_id', chapterIds).where('users_id', request.user.id)
    const userLessons = await UserLesson.query().whereIn('lessons_id', lessonIds).where('users_id', request.user.id)
    for(let i in chapters) {
      chapters[i].score = 0
      chapters[i].stars = 0
      chapters[i].quiz_status = 'didnot'
      for(let userChapter of userChapters) {
        if(chapters[i].id==userChapter.chapters_id) {
          chapters[i].score = userChapter.score
          chapters[i].stars = userChapter.stars
          chapters[i].quiz_status = userChapter.quiz_status
        }
      }
      for(let j in chapters[i].lessons) {
        chapters[i].lessons[j].quiz_status = 'didnot'
        for(let userLesson of userLessons) {
          if(chapters[i].lessons[j].id==userLesson.lessons_id) {
            chapters[i].lessons[j].quiz_status = userLesson.quiz_status
          }
        }
      }
    }
    reply.send(chapters)
  }

  static async preview (request, reply) {
    let chapters = await Chapter.query().select(['id', 'name', 'icon', 'description']).where('courses_id', request.params.courses_id).eager('lessons(orderByLessonOrder, defaultSelects)').orderBy('chapter_order')
    for(let i in chapters) {
      chapters[i].score = 0
      chapters[i].stars = 0
      chapters[i].quiz_status = 'didnot'
      for(let j in chapters[i].lessons) {
        chapters[i].lessons[j].quiz_status = 'didnot'
      }
    }
    reply.send(chapters)
  }
}

module.exports = CourseController