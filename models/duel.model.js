'use strict'

const { Model } = require('objection')
 
class Duel extends Model {
  static get tableName () {
    return 'duels'
  }
  
  // $parseDatabaseJson(json) {
  //   json = super.$parseDatabaseJson(json)
  //   try{
  //     json.details = JSON.parse(json.details)
  //   }catch(e) {
  //     json.details = {}
  //   }
  //   return json;
  // }

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
    const DuelDetail = require('./duel_detail.model')
    const DuelQuestion = require('./duel_question.model')
    return {
      starter: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'duels.starter_users_id',
          to: 'users.id'
        }
      },
      opponent: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'duels.opponent_users_id',
          to: 'users.id'
        }
      },
      details: {
        relation: Model.HasManyRelation,
        modelClass: DuelDetail,
        join: {
          from: 'duels.id',
          to: 'duel_details.duels_id'
        }
      },
      questions: {
        relation: Model.HasManyRelation,
        modelClass: DuelQuestion,
        join: {
          from: 'duels.id',
          to: 'duel_questions.duels_id'
        }
      },
    }
  }
}

module.exports = Duel