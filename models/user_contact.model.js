'use strict'

const { Model } = require('objection')
 
class UserContact extends Model {
  static get tableName () {
    return 'users_contacts'
  }
  
  async $beforeInsert (queryContext) {
    await super.$beforeInsert(queryContext)
    this.created_at = new Date()
    this.updated_at = this.created_at
  }

  static async addContact (contacts, nocontacts, users_id) {
    for(let contact of contacts) {
      let userContact = await UserContact.query().where('users_id', users_id).where('contact_id', contact.id).first()
      if(userContact==null && users_id!=contact.id) {
        await UserContact.query().insert({
          users_id,
          contact_id: contact.id,
          contact: contact.mobile,
        })
      }
    }
    for(let contact of nocontacts) {
      let userContact = await UserContact.query().where('users_id', users_id).where('contact', contact).first()
      if(userContact==null) {
        await UserContact.query().insert({
          users_id,
          contact: contact,
        })
      }
    }
    // console.log('Add Done')
  }

  static get relationMappings() {
    const User = require('./user.model')
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'users_contacts.users_id',
          to: 'users.id'
        }
      },
      friend: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'users_contacts.contact_id',
          to: 'users.id'
        }
      },
    }
  }
}

module.exports = UserContact