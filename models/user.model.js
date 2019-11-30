'use strict'

const { Model } = require('objection')
const bcrypt = require('bcrypt')
 
class User extends Model {
  static get tableName () {
    return 'users'
  }

  static get modifiers() {
    return {
      defaultSelects(builder) {
        builder.select('fname', 'lname', 'avatar', 'score', 'push_id')
      },
    };
  }

  async $beforeInsert (queryContext) {
    await super.$beforeInsert(queryContext)
    const {password} = this;
    if (password) {
      this.salt = bcrypt.genSaltSync(10)
      this.password = bcrypt.hashSync(password, this.salt);
    }
    this.created_at = new Date()
    this.updated_at = this.created_at
  }

  async $beforeUpdate (queryContext) {
    await super.$beforeUpdate(queryContext)
    const {password, salt} = this;
    if (password) {
      console.log('Hash Password', password, salt)
      this.password = bcrypt.hashSync(password, salt);
    }
    this.updated_at = new Date()
  }

  async verify (password) {
    var out = false
    try {
      if (await bcrypt.compare(password, this.password)) {
        out = true
      } 
    } catch (err) {}
    return out
  }

  static async createGuestUser () {
    const now = new Date()
    const user = await User.query().insert({
      lname: `guest_${now.getTime()}`,
      email: `guest_${now.getTime()}`,
      password: `guest_${now.getTime()}`,
    })
    return user
  }

  static get relationMappings() {
    const School = require('./school.model')

    return {
      school: {
        relation: Model.BelongsToOneRelation,
        modelClass: School,
        join: {
          from: 'users.schools_id',
          to: 'schools.id'
        }
      }
    }
  }
}
 
module.exports = User