'use strict'

const { Model } = require('objection')
 
class UserLesson extends Model {
  static get tableName () {
    return 'users_lessons'
  }
  
  async $beforeInsert (queryContext) {
    await super.$beforeInsert(queryContext)
    this.created_at = new Date()
    this.updated_at = this.created_at
  }

  async $beforeUpdate (queryContext) {
    await super.$beforeUpdate(queryContext)
    this.updated_at = new Date()
  }

  static get relationMappings() {
    const User = require('./user.model')
    const Lesson = require('./lesson.model')
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'users_lessons.users_id',
          to: 'users.id'
        }
      },
      lesson: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lesson,
        join: {
          from: 'users_lessons.lessons_id',
          to: 'lessons.id'
        }
      },
    }
  }
}

module.exports = UserLesson