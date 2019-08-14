'use strict'

const { Model } = require('objection')
 
class Chapter extends Model {
  static get tableName () {
    return 'chapters'
  }

  static get relationMappings() {
    const Course = require('./course.model')
    const Lesson = require('./lesson.model')
    return {
      course: {
        relation: Model.BelongsToOneRelation,
        modelClass: Course,
        join: {
          from: 'chapters.courses_id',
          to: 'courses.id'
        }
      },
      lessons: {
        relation: Model.HasManyRelation,
        modelClass: Lesson,
        join: {
          from: 'chapters.id',
          to: 'lessons.chapters_id'
        }
      }
    }
  }
}

module.exports = Chapter