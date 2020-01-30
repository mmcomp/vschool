'use strict'

const { Model } = require('objection')
 
class DuelDetail extends Model {
  static get tableName () {
    return 'duel_details'
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
    const Duel = require('./duel.model')
    const DuelQuestion = require('./duel_question.model')
    const Course = require('./course.model')
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'duel_details.users_id',
          to: 'users.id'
        }
      },
      duel: {
        relation: Model.BelongsToOneRelation,
        modelClass: Duel,
        join: {
          from: 'duel_details.duels_id',
          to: 'duels.id'
        }
      },
      course: {
        relation: Model.BelongsToOneRelation,
        modelClass: Course,
        join: {
          from: 'duel_details.courses_id',
          to: 'courses.id'
        }
      },
      questions: {
        relation: Model.HasManyRelation,
        modelClass: DuelQuestion,
        join: {
          from: 'duel_details.id',
          to: 'duel_questions.duel_details_id'
        }
      },
    }
  }
}

module.exports = DuelDetail