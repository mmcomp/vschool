'use strict'

const { Model } = require('objection')
 
class Question extends Model {
  static get tableName () {
    return 'questions'
  }

  $parseDatabaseJson(json) {
    json = super.$parseDatabaseJson(json)
    try{
      json.choices = JSON.parse(json.choices)
    }catch(e) {
      json.choices = null
    }
    return json;
  }

  static get relationMappings() {
    const Lesson = require('./lesson.model')

    return {
      lesson: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lesson,
        join: {
          from: 'questions.lessons_id',
          to: 'lessons.id'
        }
      }
    }
  }
}

module.exports = Question