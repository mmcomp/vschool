'use strict'

const { Model } = require('objection')
 
class Setting extends Model {
  static get tableName () {
    return 'settings'
  }

  async getValue (key) {
    const keyVal = await Setting.query().where('key', key).first()
    // console.log(keyVal)
    if(keyVal) {
      return keyVal.value
    }
    return null
  }

  async setValue (key, value) {
    const keyVal = await Setting.query().where('key', key).first()
    if(keyVal) {
      return await Setting.query().where('id', keyVal.id).update({
        value,
      })
    }
    return await Setting.query().insert({
      key,
      value
    })
  }
}

module.exports = Setting