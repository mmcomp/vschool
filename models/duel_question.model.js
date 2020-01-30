'use strict'

const { Model } = require('objection')
 
class DuelQuestion extends Model {
  static get tableName () {
    return 'duel_questions'
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
    const Duel = require('./duel.model')
    const DuelDetail = require('./duel_detail.model')
    const Question = require('./question.model')
    return {
      duel: {
        relation: Model.BelongsToOneRelation,
        modelClass: Duel,
        join: {
          from: 'duel_questions.duels_id',
          to: 'duels.id'
        }
      },
      duel_detail: {
        relation: Model.BelongsToOneRelation,
        modelClass: DuelDetail,
        join: {
          from: 'duel_questions.duel_details_id',
          to: 'duel_details.id'
        }
      },
      question: {
        relation: Model.BelongsToOneRelation,
        modelClass: Question,
        join: {
          from: 'duel_questions.questions_id',
          to: 'questions.id'
        }
      },
    }
  }
}

module.exports = DuelQuestion