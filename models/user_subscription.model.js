'use strict'

const { Model } = require('objection')
 
class UserSubscription extends Model {
  static get tableName () {
    return 'users_subscriptions'
  }
  
  async $beforeInsert (queryContext) {
    await super.$beforeInsert(queryContext)
    this.created_at = new Date()
    this.updated_at = this.created_at
  }

  // $parseDatabaseJson(json) {
  //   json = super.$parseDatabaseJson(json)
  //   console.log('Changing', json.expiration_date)
  //   json.expiration_date = new Date(new Date(json.expiration_date).toLocaleString("en-US", {timeZone: "Asia/Tehran"}))
  //   console.log('to', json.expiration_date)
  //   return json;
  // }

  static get relationMappings() {
    const User = require('./user.model')
    const Course = require('./course.model')
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'users_subscriptions.users_id',
          to: 'users.id'
        }
      },
      course: {
        relation: Model.BelongsToOneRelation,
        modelClass: Course,
        join: {
          from: 'users_chapters.courses_id',
          to: 'courses.id'
        }
      },
    }
  }
}

module.exports = UserSubscription