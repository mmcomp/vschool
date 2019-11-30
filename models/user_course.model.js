'use strict'

const { Model } = require('objection')
 
class UserCourse extends Model {
  static get tableName () {
    return 'users_courses'
  }
  
  async $beforeInsert (queryContext) {
    await super.$beforeInsert(queryContext)
    this.created_date = new Date()
    this.updated_date = this.created_date
  }

  static get relationMappings() {
    const User = require('./user.model')
    const Course = require('./Course.model')
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'users_courses.users_id',
          to: 'users.id'
        }
      },
      course: {
        relation: Model.BelongsToOneRelation,
        modelClass: Course,
        join: {
          from: 'users_courses.courses_id',
          to: 'courses.id'
        }
      },
    }
  }
}

module.exports = UserCourse