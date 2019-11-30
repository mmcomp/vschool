'use strict'

const { Model } = require('objection')
 
class School extends Model {
  static get tableName () {
    return 'schools'
  }

  static get relationMappings() {
    const User = require('./user.model')

    return {
      users: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'schools.id',
          to: 'users.schools_id'
        }
      }
    }
  }
}

module.exports = School