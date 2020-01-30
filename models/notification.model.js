'use strict'

const { Model } = require('objection')
 
class Notification extends Model {
  static get tableName () {
    return 'notifications'
  }
}

module.exports = Notification