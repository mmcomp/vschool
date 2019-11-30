'use strict'

const { Model } = require('objection')
 
class UserPage extends Model {
  static get tableName () {
    return 'users_pages'
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
    const Page = require('./page.model')
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'users_pages.users_id',
          to: 'users.id'
        }
      },
      page: {
        relation: Model.BelongsToOneRelation,
        modelClass: Page,
        join: {
          from: 'users_pages.pages_id',
          to: 'pages.id'
        }
      },
    }
  }
}

module.exports = UserPage