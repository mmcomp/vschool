'use strict'

const UserSubscription = require('../models/user_subscription.model')
const Setting = require('../models/setting.model')
const Course = require('../models/course.model')

class SubscriptionController {
  static formatDate (inp) {
    const twoDigits = function(inp) {
      if(inp<10) {
        return `0${inp}`;
      }
      return `${inp}`;
    };

    let current_datetime = new Date(inp)
    return  current_datetime.getUTCFullYear() + "-" + twoDigits(current_datetime.getUTCMonth() + 1) + "-" + twoDigits(current_datetime.getUTCDate()) + " " + twoDigits(current_datetime.getUTCHours()) + ":" + twoDigits(current_datetime.getUTCMinutes()) + ":" + twoDigits(current_datetime.getUTCSeconds())
  }

  static async status () {
    await UserSubscription.query().where('expiration_date', '<', new Date()).update({
      is_active: 0,
    })
  }

  static async history (request, reply) {
    SubscriptionController.status()
    const userSubscriptions = await UserSubscription.query().select(['type', 'expiration_date']).where('users_id', request.user.id)
    reply.send({
      subscriptions: userSubscriptions,
    })
  }

  static async load (request, reply) {
    SubscriptionController.status()
    const userSubscriptions = await UserSubscription.query().select(['type', 'expiration_date']).where('users_id', request.user.id).where('is_active', 1)
    reply.send({
      subscription: userSubscriptions,
    })
  }

  static async add (request, reply) {
    SubscriptionController.status()
    const {type} = request.body
    const courses_id = (request.body.course)?request.body.course:0

    let amount = 0
    if(courses_id==0) {
      const setting = new Setting()
      amount = await setting.getValue(type)
    }else {
      const course = await Course.query().where('id', courses_id).first()
      if(course) {
        amount = course[type]
      }
    }
    if(amount==null) {
      amount = 0
    }

    let days = 30
    if(type=='half_annual_price') {
      days = 180
    }else if(type=='annually_price') {
      days = 365
    }
    let expiration_date = new Date();
    expiration_date.setDate(expiration_date.getDate() + days);

    await UserSubscription.query().insert({
      users_id: request.user.id,
      type,
      courses_id,
      amount,
      expiration_date,
      is_active: 1,
    })
    reply.send()
  }
}

module.exports = SubscriptionController