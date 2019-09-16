'use strict'

const { Model } = require('objection')
 
class UserChapter extends Model {
  static get tableName () {
    return 'users_chapters'
  }
  
  async $beforeInsert (queryContext) {
    await super.$beforeInsert(queryContext)
    this.created_date = new Date()
  }

  static get relationMappings() {
    const User = require('./user.model')
    const Chapter = require('./chapter.model')
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'users_chapters.users_id',
          to: 'users.id'
        }
      },
      chapter: {
        relation: Model.BelongsToOneRelation,
        modelClass: Chapter,
        join: {
          from: 'users_chapters.chapters_id',
          to: 'chapters.id'
        }
      },
    }
  }
}

module.exports = UserChapter