'use strict'

const Chapter = require('../models/chapter.model')
const Lesson = require('../models/lesson.model')
const Page = require('../models/page.model')
const UserSubscription = require('../models/user_subscription.model')

const SubscriptionController = require('./subscription.controller')



class LessonController {
  static async index (request, reply) {
    const lessons = await Lesson.query().eager('[ chapter(defaultSelects), chapter(defaultSelects).[ course(defaultSelects) ], questions(defaultSelects) ]')
    reply.send(lessons)
  }

  static async pages (request, reply) {
    const lessons = await Lesson.query().eager('[ chapter(defaultSelects), chapter(defaultSelects).[ course(defaultSelects) ], questions(defaultSelects), pages(defaultSelects, orderByPageOrder) ]')
    reply.send(lessons)
  }
  
  static async lessonPages (request, reply) {
    await SubscriptionController.status()
    let userSubscriptions = await UserSubscription.query().where('courses_id', 0).where('users_id', request.user.id).where('is_active', 1).first()
    let applicationSubscription = false
    if(userSubscriptions) {
      applicationSubscription = true
    }

    const tmpPages = await Page.query().select(['id', 'page']).where('lessons_id', request.params.lessons_id).eager('[question(defaultSelects), lesson.[chapter.[course]]]')
    if(!tmpPages[0]) {
      return reply.send([])
    }
    const course_id = tmpPages[0].lesson.chapter.course.id
    const chapter_order = tmpPages[0].lesson.chapter.chapter_order
    let chaptersBefore = await Chapter.query().where('courses_id', course_id).where('id', '!=', tmpPages[0].lesson.chapter.id).where('chapter_order', '<=', chapter_order).count()
    chaptersBefore = chaptersBefore[0]['count(*)']
    if(chaptersBefore>0 && applicationSubscription==false) {
      userSubscriptions = await UserSubscription.query().where('courses_id', course_id).where('users_id', request.user.id).where('is_active', 1).first()
      if(!userSubscriptions) {
        return reply.code(406).send({
          statusCode: 406,
          error: "Not Acceptable",
          message: "این درست مستلزم پرداخت اشتراک است"
        })
      }
    }
    let pages = [], datas
    for(let page of tmpPages) {
      datas = []
      if(page.page) {
        for(let data of page.page.data) {
          delete data.deleted
          if(data.type=='image') {
            data.data = `/page_images/page_${page.id}/${data.data}`
          }
          datas.push(data)
        }
      }
      if(!page.page) {
        page.page = {}
      }
      page.page.data = datas
      delete page.lesson
      pages.push(page)
    }
    reply.send(pages)
  }
}

module.exports = LessonController