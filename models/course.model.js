'use strict'

const { Model, raw } = require('objection')
 
class Course extends Model {
  static get tableName () {
    return 'courses'
  }

  static get modifiers() {
    return {
      defaultSelects(builder) {
        builder.select('id', 'name', 'description', 'duel_time')
      },
    };
  }

  static get relationMappings() {
    const Chapter = require('./chapter.model')

    return {
      chapters: {
        relation: Model.HasManyRelation,
        modelClass: Chapter,
        join: {
          from: 'courses.id',
          to: 'chapters.courses_id'
        }
      }
    }
  }

  async randomQuestion (count = 3) {
    const Question  = require('./question.model')
    const questions = await Question.query().where('courses_id', this.id).limit(count).orderBy(raw('RAND()'))
    return questions
  }

}

module.exports = Course