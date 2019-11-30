'use strict'

const { Model } = require('objection')
 
class Lesson extends Model {
  static get tableName () {
    return 'lessons'
  }

  static get modifiers() {
    return {
      defaultSelects(builder) {
        builder.select('id', 'name', 'description')
      },

      orderByLessonOrder(builder) {
        builder.orderBy('lesson_order');
      }
    };
  }

  static get relationMappings() {
    const Chapter = require('./chapter.model')
    const Question = require('./question.model')
    const Page = require('./page.model')
    return {
      chapter: {
        relation: Model.BelongsToOneRelation,
        modelClass: Chapter,
        join: {
          from: 'lessons.chapters_id',
          to: 'chapters.id'
        }
      },
      questions: {
        relation: Model.HasManyRelation,
        modelClass: Question,
        join: {
          from: 'lessons.id',
          to: 'questions.lessons_id'
        }
      },
      pages: {
        relation: Model.HasManyRelation,
        modelClass: Page,
        join: {
          from: 'lessons.id',
          to: 'pages.lessons_id'
        }
      }
    }
  }
}

module.exports = Lesson