'use strict'

const Duel = require('../models/duel.model')
const UserController = require('./user.controller')

class DuelController {
  static async start (request, reply) {
    let today = new Date()
    today.setSeconds(-1 * process.env.DUEL_TIMEOUT)
    let dd = today.getDate() 
    let mm = today.getMonth() + 1
    let hh = today.getHours()
    let ii = today.getMinutes()
    let ss = today.getSeconds()
    let yyyy = today.getFullYear() 
    if (dd < 10) { 
        dd = '0' + dd;
    } 
    if (mm < 10) { 
        mm = '0' + mm 
    } 
    if (hh < 10) { 
      hh = '0' + hh 
    } 
    if (ii < 10) { 
      ii = '0' + ii 
    }
    if (ss < 10) { 
      ss = '0' + ss 
    }   
    today = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + ii + ':' + ss 
    let duel = await Duel.query().select(['id', 'user_turn']).where('opponent_users_id', 0).eager('[starter(defaultSelects), opponent(defaultSelects)]')
      .where('starter_users_id', request.user.id)
      .first()
    if(!duel) {
      console.log('User does not have an open duel')
      duel = await Duel.query().select(['id', 'user_turn']).where('opponent_users_id', 0)
        .where('updated_at', '>=', today)
        .where('education_level', request.user.education_level)
        .where('starter_users_id', '!=', request.user.id).eager('[starter(defaultSelects), opponent(defaultSelects)]')
        .first()
      if(!duel) {
        console.log('There is no other open duels')
        duel = await Duel.query().insertAndFetch({
          education_level: request.user.education_level,
          starter_users_id: request.user.id,
        }).eager('[starter(defaultSelects), opponent(defaultSelects)]')
        duel = duel.toJSON()
        delete duel.education_level
        delete duel.starter_users_id
        delete duel.created_at
        delete duel.updated_at
        delete duel.opponent_users_id
        delete duel.details
      }else {
        console.log('There was an open duel of others')
        // const user_turns = ['starter', 'opponent']
        // const user_turn = user_turns[Math.round(Math.random())]
        await Duel.query().where('id', duel.id).update({
          opponent_users_id: request.user.id,
          user_turn: 'opponent',
        })
        duel = await Duel.query().select(['id', 'user_turn']).where('id', duel.id).eager('[starter(defaultSelects), opponent(defaultSelects)]').first()

        if(duel.starter.push_id) {
          UserController.sendPushe([duel.starter.push_id], process.env.PUSH_TITLE, process.env.PUSH_CONTENT.replace(/#user#/g, `${duel.opponent.fname} ${duel.opponent.lname}`)).then(res=>{
            console.log(`Send Push To ${duel.starter.fname} ${duel.starter.lname} Result:`)
            console.log(res.data)
          }).catch(e=>{
            console.log(`Send Push To ${duel.starter.fname} ${duel.starter.lname} Error:`)
            console.log(e)
          })
        }
        if(duel.opponent.push_id) {
          UserController.sendPushe([duel.opponent.push_id], process.env.PUSH_TITLE, process.env.PUSH_CONTENT.replace(/#user#/g, `${duel.starter.fname} ${duel.starter.lname}`)).then(res=>{
            console.log(`Send Push To ${duel.opponent.fname} ${duel.opponent.lname} Result:`)
            console.log(res.data)
          }).catch(e=>{
            console.log(`Send Push To ${duel.opponent.fname} ${duel.opponent.lname} Error:`)
            console.log(e)
          })
        }
      }
    }else {
      console.log('User has an open duel')
      Duel.query().update({
        education_level: request.user.education_level,
      }).where('id', duel.id).then(res=>{}).catch(e=>{
        console.log('Update Error', e)
      })
    }
    reply.send(duel)
  }
}

module.exports = DuelController