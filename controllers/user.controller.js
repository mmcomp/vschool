'use strict'

const User = require('../models/user.model.js')
const Course = require('../models/course.model')
const Chapter = require('../models/chapter.model')
const Lesson = require('../models/lesson.model')
const Page = require('../models/page.model')
const UserCourse = require('../models/user_course.model')
const UserChapter = require('../models/user_chapter.model')
const UserLesson = require('../models/user_lesson.model')
const UserPage = require('../models/user_page.model')
const UserContact = require('../models/user_contact.model')
const axios = require('axios')

// const fs = require('fs')
// const compressing = require('compressing')

class UserController {
  static async test (request, reply) {
    const course = await Course.query().eager('[chapters, chapters.[lessons, lessons.[questions, pages, pages.question]]]').where('id', 1).first()
    // console.log(course);
    // fs.writeFileSync('./public/course.json', JSON.stringify(course))
    // const compressResult = await compressing.gzip.compressFile('./public/course.json', `./public/course_${course.id}.json.gz`)
    // fs.unlinkSync('./public/course.json')
    // console.log(compressResult)
    reply.send(course)

    // reply.send(request.user)
  }

  static async setPushId (request, reply) {
    User.query().where('id', request.user.id).update({
      push_id: request.body.push_id,
    }).then(res=>{
    }).catch(e=>{
      console.log('Set USer Push Id Error', e)
    })
    reply.send()
  }

  static async profile (request, reply) {
    const user = await User.query().where('id', request.user.id).first()
    if(!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "کاربر شما درست وارد نشده است مجدد توکن بگیرید"
      })
    }
    if(user.otp!=request.body.otp) {
      return reply.code(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "کد پیامک وارد شده صحیح نمی باشد"
      })
    }
    request.body['salt'] = user.salt
    request.body['is_guest'] = 0
    if(request.body.mobile) {
      delete request.body.mobile
    }
    delete request.body.otp
    User.query().where('id', user.id).update(request.body).then(result => {
      console.log('Update Result', result)
    }).catch(e => {
      console.log('Update Error', e)
    })
    reply.code(200).send()
  }

  static async introduce (request, reply) {
    const user = await User.query().where('id', request.user.id).first()
    if(!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "کاربر شما درست وارد نشده است مجدد توکن بگیرید"
      })
    }

    User.query().where('id', user.id).update(request.body).then(result => {
      console.log('Update Result', result)
    }).catch(e => {
      console.log('Update Error', e)
    })
    reply.code(200).send()
  }

  static async passPage (request, reply) {
    const page = await Page.query().eager('lesson').findById(request.params.pages_id)
    if(!page) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "صفحه مورد نظر پیدا نشد"
      })
    }
    const chapter = await page.lesson.$relatedQuery('chapter')
    const course = await chapter.$relatedQuery('course')
    const userPage = await UserPage.query().where('users_id', request.user.id).where('pages_id', request.params.pages_id).where('quiz_status', '!=', 'passed').first()
    if(userPage) {
      return reply.code(409).send({
        statusCode: 409,
        error: "Already Passed",
        message: "صفحه مورد نظر برای کاربر قبلا ثبت شده است"
      })
    }

    const previousPage = await Page.query().where('lessons_id', page.lessons_id).where('id', '!=', page.id).where('page_order', '<=', page.page_order).orderBy('page_order', 'desc').first()
    if(previousPage) {
      const preUserPage = await UserPage.query().where('users_id', request.user.id).where('pages_id', previousPage.id).where('quiz_status', '!=', 'passed').first()
      if(!preUserPage) {
        return reply.code(406).send({
          statusCode: 406,
          error: "Not Acceptable",
          message: "کاربر صفحه قبلی را نگذرانده است"
        })
      }
    }else {
      const previousLesson = await Lesson.query().where('chapters_id', page.lesson.chapters_id).where('id', '!=', page.lessons_id).where('lesson_order', '<=', page.lesson.lesson_order).orderBy('lesson_order', 'desc').first()
      if(previousLesson) {
        const preUserLesson = await UserLesson.query().where('users_id', request.user.id).where('lessons_id', previousLesson.id).where('quiz_status', '!=', 'passed').first()
        if(!preUserLesson) {
          return reply.code(406).send({
            statusCode: 406,
            error: "Not Acceptable",
            message: "کاربر درس قبلی را نگذرانده است"
          })
        }
      }else {
        const previousChapter = await Chapter.query().where('courses_id', chapter.courses_id).where('id', '!=', chapter.id).where('chapter_order', '<=', chapter.chapter_order).orderBy('chapter_order', 'desc').first()
        if(previousChapter) {
          const preUserChapter = await UserChapter.query().where('users_id', request.user.id).where('chapters_id', previousChapter.id).where('quiz_status', '!=', 'passed').first()
          if(!preUserChapter) {
            return reply.code(406).send({
              statusCode: 406,
              error: "Not Acceptable",
              message: "کاربر فصل قبلی را نگذرانده است"
            })
          }

          const previousChapterCount = await Chapter.query().where('courses_id', chapter.courses_id).where('id', '!=', chapter.id).where('chapter_order', '<=', chapter.chapter_order).orderBy('chapter_order', 'desc').count()
          const requiredStar = parseInt(previousChapterCount * 3 * process.env.CHAPTER_REQUIRED_STAR_PORTION, 10)
          const currentStar = await UserChapter.query().where('users_id', request.user.id).sum('star')
          if(currentStar<requiredStar) {
            return reply.code(406).send({
              statusCode: 406,
              error: "Not Acceptable",
              message: `کاربر می بایست ${requiredStar} ستاره از مجموع فصل های گذشته کسب کند`
            })
          }
        }
      }
    }

    let out = {}
    const nextPage = await Page.query().where('lessons_id', page.lessons_id).where('id', '!=', page.id).where('page_order', '>=', page.page_order).orderBy('page_order', 'desc').first()
    if(!nextPage) {
      UserLesson.query().insert({
        users_id: request.user.id,
        lessons_id: page.lessons_id
      }).then(res=>{
        console.log('User Lesson Insert Result', res)
      }).catch(e => {
        console.log('User Lesson Insert Error', e)
      })
      out = {
        finished_lesson: page.lessons_id
      }
      const nextLesson = await Lesson.query().where('chapters_id', page.lesson.chapters_id).where('id', '!=', page.lessons_id).where('lesson_order', '>=', page.lesson.lesson_order).orderBy('lesson_order', 'desc').first()
      if(!nextLesson) {
        out['finished_chapter'] = page.lesson.chapters_id
        UserChapter.query().insert({
          users_id: request.user.id,
          chapters_id: page.lesson.chapters_id
        }).then(res=>{
          console.log('User Chapter Insert Result', res)
        }).catch(e => {
          console.log('User Chapter Insert Error', e)
        })

        const nextChapter = await Chapter.query().where('courses_id', course.id).where('id', '!=', chapter.id).where('chapter_order', '>=', chapter.chapter_order).orderBy('chapter_order', 'desc').first()
        if(!nextChapter) {
          out['finished_course'] = course.id
          UserCourse.query().insert({
            users_id: request.user.id,
            courses_id: course.id
          }).then(res=>{
            console.log('User Course Insert Result', res)
          }).catch(e => {
            console.log('User Course Insert Error', e)
          })
        }
      }
    }
    UserPage.query().insert({
      users_id: request.user.id,
      pages_id: page.id,
    }).then(res=>{
      console.log('User Page Insert Result', res)
    }).catch(e => {
      console.log('User Page Insert Error', e)
    })


    return reply.send(out)
  }

  static async sendPushe (pushIds, title, content, icon) {
    try{
      let pusheData = {
        app_ids: [process.env.PUSH_PACKAGE],
        data: {
          title,
          content,
          show_app: "true",
        },
      }
      if(icon) {
        pusheData.data['icon'] = icon
      }
      if(pushIds && pushIds[0]) {
        pusheData['filters'] = {
          pushe_id: pushIds,
        }
      }
      const res = await axios({
        method: 'POST',
        headers: {
            'Authorization': 'Token ' + process.env.PUSH_TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        url : process.env.PUSH_URL, 
        data: pusheData,
      })

      return res
    }catch(e) {
      console.log('Send Pushe Error')
      console.log(e)
      return e
    }
  }

  static async pushTest(request, reply) {
    reply .send(UserController.sendPushe([], 'Test One', 'Test One Push'))
  }

  static async contacts (request, reply) {
    const user = await User.query().where('id', request.user.id).first()
    if(!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "کاربر شما درست وارد نشده است مجدد توکن بگیرید"
      })
    }
    const mobiles = request.body.contacts
    let inMobiles = []
    let outMobiles = []
    const contacts = await User.query().select(['fname', 'lname', 'id', 'avatar', 'mobile']).whereIn('mobile', mobiles).where('is_guest', 0)
    for(let contact of contacts) {
      inMobiles.push(contact.mobile)
    }
    for(let mobile of mobiles) {
      if(inMobiles.indexOf(mobile)<0) {
        outMobiles.push(mobile)
      }
    }
    // console.log(request.body)
    UserContact.addContact(contacts, outMobiles, user.id)
    reply.code(200).send(contacts)
  }

  static async addFriend (request, reply) {
    const friend = await User.query().where('id', request.params.users_id).first()
    if(friend==null) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "دوست شما پیدا نشد"
      })
    }

    const userContact = await UserContact.query().where('users_id', request.user.id).where('contact_id', friend.id).first()
    if(userContact==null) {
      await UserContact.query().insert({
        users_id: request.user.id,
        contact_id: friend.id,
        contact: friend.mobile,
        is_friend: 1,
      })

      return reply.send()
    }

    if(userContact.is_friend) {
      return reply.code(406).send({
        statusCode: 406,
        error: "Not Acceptable",
        message: "دوست شما قبلا به لیستتان اضافه شده است"
      })
    }

    await UserContact.query().where('id', userContact.id).update({
      is_friend: 1,
    })

    return reply.send()
  }

  static async addFriends (request, reply) {
    const friends = await User.query().whereIn('id', request.body.contacts).where('id', '!=', request.user.id)
    if(!friends[0]) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "دوستی پیدا نشد"
      })
    }

    let userContact = null
    for(let friend of friends) {
      userContact = await UserContact.query().where('users_id', request.user.id).where('contact_id', friend.id).first()
      if(userContact==null) {
        await UserContact.query().insert({
          users_id: request.user.id,
          contact_id: friend.id,
          contact: friend.mobile,
          is_friend: 1,
        })
      }else if(userContact.is_friend==0){
        await UserContact.query().where('id', userContact.id).update({
          is_friend: 1,
        })
      }
    }

    return reply.send()
  }

  static async list (request, reply) {
    const friends = await UserContact.query().where('users_id', request.user.id).where('is_friend', 1).eager('[friend(defaultFriendSelects)]')
    let output = []
    for(let friend of friends) {
      output.push(friend.friend)
    }
    return reply.send(output)
  }
}

module.exports = UserController