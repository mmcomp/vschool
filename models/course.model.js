'use strict'

const { Model } = require('objection')
 
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
}

module.exports = Course