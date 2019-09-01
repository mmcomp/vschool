'use strict'

const { Model } = require('objection')
 
class Page extends Model {
  static get tableName () {
    return 'pages'
  }

  $parseDatabaseJson(json) {
    json = super.$parseDatabaseJson(json)
    try{
      json.page = JSON.parse(json.page)
    }catch(e) {
      json.page = {
        image: '',
        notes: [],
        title: '',
        content1: '',
        content2: '',
        formulas: [],
      }
    }
    return json;
  }

  static get relationMappings() {
    const Lesson = require('./lesson.model')
    const Question = require('./question.model')
    return {
      lesson: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lesson,
        join: {
          from: 'pages.lessons_id',
          to: 'lessons.id'
        }
      },
      question: {
        relation: Model.BelongsToOneRelation,
        modelClass: Question,
        join: {
          from: 'pages.id',
          to: 'questions.pages_id'
        }
      }
    }
  }
}

module.exports = Page