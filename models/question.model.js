'use strict'

const { Model } = require('objection')
 
class Question extends Model {
  static get tableName () {
    return 'questions'
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