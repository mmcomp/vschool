'use strict'

const { Model } = require('objection')
 
class Course extends Model {
  static get tableName () {
    return 'courses'
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