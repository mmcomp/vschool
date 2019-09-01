'use strict'

const User = require('../models/user.model.js')

const Course = require('../models/course.model')
const fs = require('fs')
const compressing = require('compressing')

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
}

module.exports = UserController