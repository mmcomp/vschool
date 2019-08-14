'use strict'

const { Model } = require('objection')
 
class Lesson extends Model {
  static get tableName () {
    return 'lessons'
  }

  static get relationMappings() {
    const Chapter = require('./chapter.model')
    const Question = require('./question.model')
    return {
      chapter: {
        relation: Model.BelongsToOneRelation,
        modelClass: Chapter,
        join: {
          from: 'lessons.chapters_id',
          to: 'chpaters.id'
        }
      },
      questions: {
        relation: Model.HasManyRelation,
        modelClass: Question,
        join: {
          from: 'lessons.id',
          to: 'questions.lessons_id'
        }
      }
    }
  }
}

module.exports = Lesson