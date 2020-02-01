'use strict'

const Duel = require('../models/duel.model')
const DuelDetail = require('../models/duel_detail.model')
const DuelQuestion = require('../models/duel_question.model')
const Course = require('../models/course.model')
const Notification = require('../models/notification.model')
const UserController = require('./user.controller')


class DuelController {
  static timeMines (inp) {
    let today = new Date()
    today.setSeconds(-1 * inp)
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
    return today
  }

  static async status () {
    const matchTimeout = DuelController.timeMines(process.env.DUEL_TIMEOUT)
    await Duel.query().where('opponent_users_id', 0).where('updated_at', '<', matchTimeout).delete()
    const responseTimeout = DuelController.timeMines(process.env.DUEL_REQUEST_TIMEOUT)
    const timeoutDuels = await Duel.query().where('opponent_users_id', '!=', 0).where('status', 'matched').where('updated_at', '<', responseTimeout).eager('[starter(defaultSelects), opponent(defaultSelects)]')
    for(let duel of timeoutDuels) {
      await Duel.query().where('id', duel.id).update({
        status: 'timeout_answer_' + duel.user_turn
      })
      ///PUSH
      if(duel.starter.push_id) {
        console.log('Send Push to ' + duel.starter.push_id,  process.env.PUSH_FINISH_CONTENT
        .replace(/#user#/g, `${(duel.opponent.fname)?duel.opponent.fname:''} ${duel.opponent.lname}`)
        .replace(/#congrats#/g, (duel.user_turn!='starter')?`تبریک`:`تسلیت`)
        .replace(/#stat#/g, ((duel.user_turn!='starter')?`برنده`:`بازنده`)))
        UserController.sendPushe([duel.starter.push_id], process.env.PUSH_FINISH_TITLE, process.env.PUSH_FINISH_CONTENT
          .replace(/#user#/g, `${(duel.opponent.fname)?duel.opponent.fname:''} ${duel.opponent.lname}`)
          .replace(/#congrats#/g, (duel.user_turn!='starter')?`تبریک`:`تسلیت`)
          .replace(/#stat#/g, ((duel.user_turn!='starter')?`برنده`:`بازنده`))
        ).then(res=>{
          console.log(`Send Push To ${duel.starter.fname} ${duel.starter.lname} Result:`)
          console.log(res.data)
        }).catch(e=>{
          console.log(`Send Push To ${duel.starter.fname} ${duel.starter.lname} Error:`)
          console.log(e)
        })
      }
      if(duel.opponent.push_id) {
        console.log('Send Push to ' + duel.opponent.push_id, process.env.PUSH_FINISH_CONTENT
        .replace(/#user#/g, `${(duel.opponent.fname)?duel.opponent.fname:''} ${duel.opponent.lname}`)
        .replace(/#congrats#/g, (duel.user_turn!='opponent')?`تبریک`:`تسلیت`)
        .replace(/#stat#/g, ((duel.user_turn!='opponent')?`برنده`:`بازنده`)))
        UserController.sendPushe([duel.opponent.push_id],  process.env.PUSH_FINISH_TITLE, process.env.PUSH_FINISH_CONTENT
          .replace(/#user#/g, `${(duel.opponent.fname)?duel.opponent.fname:''} ${duel.opponent.lname}`)
          .replace(/#congrats#/g, (duel.user_turn!='opponent')?`تبریک`:`تسلیت`)
          .replace(/#stat#/g, ((duel.user_turn!='opponent')?`برنده`:`بازنده`))
        ).then(res=>{
          console.log(`Send Push To ${duel.opponent.fname} ${duel.opponent.lname} Result:`)
          console.log(res.data)
        }).catch(e=>{
          console.log(`Send Push To ${duel.opponent.fname} ${duel.opponent.lname} Error:`)
          console.log(e)
        })
      }
      //\PUSH
    }
    return 'done'
  }

  static async start (request, reply) {
    DuelController.status()
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
    let concurrentDuels = await Duel.query().where(function(query){
      query.where('starter_users_id', request.user.id).orWhere('opponent_users_id', request.user.id)
    }).whereIn('status', ['matched', 'waiting']).count()
    concurrentDuels = concurrentDuels[0]['count(*)']
    if(concurrentDuels>=process.env.DUEL_CONCURRENT) {
      return reply.code(403).send('Too many ongoing duels')
    }
    let duel = await Duel.query().select(['id', 'user_turn', 'status', 'updated_at']).where('opponent_users_id', 0).eager('[starter(defaultSelects), opponent(defaultSelects)]')
      .where('starter_users_id', request.user.id)
      .first()
    if(!duel) {
      console.log('User does not have an open duel')
      duel = await Duel.query().select(['id', 'user_turn', 'status', 'updated_at']).where('opponent_users_id', 0)
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

      }else {
        console.log('There was an open duel of others')
        await Duel.query().where('id', duel.id).update({
          opponent_users_id: request.user.id,
          status: 'matched',
        })
        duel = await Duel.query().select(['id', 'user_turn', 'status', 'updated_at']).where('id', duel.id).eager('[starter(defaultSelects), opponent(defaultSelects)]').first()

        if(duel.starter.push_id) {
          console.log('Send Push to ' + duel.starter.push_id)
          UserController.sendPushe([duel.starter.push_id], process.env.PUSH_TITLE, process.env.PUSH_CONTENT.replace(/#user#/g, `${duel.opponent.fname} ${duel.opponent.lname}`)).then(res=>{
            console.log(`Send Push To ${duel.starter.fname} ${duel.starter.lname} Result:`)
            console.log(res.data)
          }).catch(e=>{
            console.log(`Send Push To ${duel.starter.fname} ${duel.starter.lname} Error:`)
            console.log(e)
          })
        }
        if(duel.opponent.push_id) {
          console.log('Send Push to ' + duel.opponent.push_id)
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
      console.log('User has an open duel', duel)
    }
    reply.send(duel)
  }

  static async index (request, reply) {
    DuelController.status()
    const duels = await Duel.query().select(['id', 'user_turn', 'status', 'updated_at']).where(function(query) {
      query.where('starter_users_id', request.user.id).orWhere('opponent_users_id', request.user.id)
    }).whereIn('status', ['waiting', 'matched', 'started']).eager('[starter(defaultSelects), opponent(defaultSelects), details, questions]')

    reply.send(duels)
  }

  static async setCourse (request, reply) {
    const duel = await Duel.query().where('id', request.body.duel_id).eager('[details, details.[questions], starter(defaultSelects), opponent(defaultSelects)]').first()
    if(!duel) {
      return reply.code(404).send('Duel not found')
    }

    const isStarter = (duel.starter_users_id==request.user.id)

    if(duel.starter_users_id!=request.user.id && duel.opponent_users_id!=request.user.id) {
      return reply.code(401).send('Duel is not for you')
    }

    if(duel.status!='matched') {
      return reply.code(403).send('Duel is not in the play mode')
    }

    if(duel.details.length>=1 && !request.body.answers) {
      return reply.code(403).send('You must send last question answers')
    }else if(duel.details.length>=1) {
      for(let answerIndex in request.body.answers) {
        if(isStarter) {
          await DuelQuestion.query().where('questions_id', answerIndex).update({
            starter_correct_answer: (request.body.answers[answerIndex]===true)?'correctly_answered':'incorrectly_answered'
          }) 
        }else{
          await DuelQuestion.query().where('questions_id', answerIndex).update({
            opponent_correct_answer: (request.body.answers[answerIndex]===true)?'correctly_answered':'incorrectly_answered'
          }) 
        }
      }
    }

    if(duel.details.length>=3){
      //Finish Duel
      let starterResults = 0
      let opponentResults = 0

      const duelQuestions = await DuelQuestion.query().where('duels_id', duel.id)
      for(let duelQuestion of duelQuestions) {
        if(duelQuestion.starter_correct_answer=='correctly_answered') {
          starterResults++
        }
        if(duelQuestion.opponent_correct_answer=='correctly_answered') {
          opponentResults++
        }
      }

      let duelStatus = 'finished'
      if(starterResults>opponentResults) {
        duelStatus += '_starter_wined'
      }else if(starterResults<opponentResults) {
        duelStatus += '_opponent_wined'
      }


      await Duel.query().where('id', duel.id).update({
        status: duelStatus
      })
      ///PUSH
      if(duel.starter.push_id) {
        console.log('Send Push to ' + duel.starter.push_id,  process.env.PUSH_FINISH_CONTENT
        .replace(/#user#/g, `${(duel.opponent.fname)?duel.opponent.fname:''} ${duel.opponent.lname}`)
        .replace(/#congrats#/g, (starterResults>=opponentResults)?`تبریک`:`تسلیت`)
        .replace(/#stat#/g, ((starterResults>opponentResults)?`برنده`:((starterResults<opponentResults)?`بازنده`:`مساوی`))))
        UserController.sendPushe([duel.starter.push_id], process.env.PUSH_FINISH_TITLE, process.env.PUSH_FINISH_CONTENT
          .replace(/#user#/g, `${(duel.opponent.fname)?duel.opponent.fname:''} ${duel.opponent.lname}`)
          .replace(/#congrats#/g, (starterResults>=opponentResults)?`تبریک`:`تسلیت`)
          .replace(/#stat#/g, ((starterResults>opponentResults)?`برنده`:((starterResults<opponentResults)?`بازنده`:`مساوی`)))
        ).then(res=>{
          console.log(`Send Push To ${duel.starter.fname} ${duel.starter.lname} Result:`)
          console.log(res.data)
        }).catch(e=>{
          console.log(`Send Push To ${duel.starter.fname} ${duel.starter.lname} Error:`)
          console.log(e)
        })
      }
      if(duel.opponent.push_id) {
        console.log('Send Push to ' + duel.opponent.push_id, process.env.PUSH_FINISH_CONTENT
        .replace(/#user#/g, `${(duel.starter.fname)?duel.starter.fname:''} ${duel.starter.lname}`)
        .replace(/#congrats#/g, (starterResults<=opponentResults)?`تبریک`:`تسلیت`)
        .replace(/#stat#/g, ((starterResults<opponentResults)?`برنده`:((starterResults>opponentResults)?`بازنده`:`مساوی`))))
        UserController.sendPushe([duel.opponent.push_id],  process.env.PUSH_FINISH_TITLE, process.env.PUSH_FINISH_CONTENT
          .replace(/#user#/g, `${(duel.starter.fname)?duel.starter.fname:'' } ${duel.starter.lname}`)
          .replace(/#congrats#/g, (starterResults<=opponentResults)?`تبریک`:`تسلیت`)
          .replace(/#stat#/g, ((starterResults<opponentResults)?`برنده`:((starterResults>opponentResults)?`بازنده`:`مساوی`)))
        ).then(res=>{
          console.log(`Send Push To ${duel.opponent.fname} ${duel.opponent.lname} Result:`)
          console.log(res.data)
        }).catch(e=>{
          console.log(`Send Push To ${duel.opponent.fname} ${duel.opponent.lname} Error:`)
          console.log(e)
        })
      }
      //\PUSH
      return reply.send({
        yourResult: (isStarter)?starterResults:opponentResults,
        otheResult: (isStarter)?opponentResults:starterResults,
      })
    }

    if((duel.user_turn=='starter' && duel.starter_users_id!=request.user.id)||(duel.user_turn=='opponent' && duel.opponent_users_id!=request.user.id)) {
      return reply.code(400).send('It is not your turn in this duel')
    }

    const course = await Course.query().where('published', 1).where('education_level', request.user.education_level).where('id', request.body.course_id).first()
    if(!course) {
      return reply.code(404).send('Course not found')
    }


    let duelCourses = []
    for(let detail of duel.details) {
      duelCourses.push(detail.courses_id)
    }
    // console.log(duelCourses)

    let educationLevelCourseCount = await Course.query().where('published', 1).where('education_level', request.user.education_level).count()
    educationLevelCourseCount = educationLevelCourseCount[0]['count(*)']
    if(educationLevelCourseCount>=3 && duelCourses.indexOf(course.id)>=0) {
      return reply.code(403).send('Course is repetitious')
    }

    if(educationLevelCourseCount<3) {
      Notification.query().insert({
        title: " دوره کمتر از ۳ تا در پایه " + request.user.education_level,
        description: " دوره کمتر از  ۳ تا در پایه " + request.user.education_level,
      })
    }


    const questions = await course.randomQuestion()
    if(questions.length<3) {
      Notification.query().insert({
        title: `دوره ${course.name} سوال برای دوئل کم دارد`,
        description: `دوره ${course.name} سوال برای دوئل کم دارد`,
      }).then().catch()
      return reply.code(403).send('Course has not enough questions')
    }

    const duelDetail = await DuelDetail.query().insertAndFetch({
      duels_id: duel.id,
      courses_id: course.id,
      users_id: request.user.id,
      order: duel.details.length
    })

    for(let question of questions) {
      await DuelQuestion.query().insert({
        duels_id: duel.id,
        duel_details_id: duelDetail.id,
        questions_id: question.id,
      })
    }

    await Duel.query().where('id', duel.id).update({
      user_turn: (isStarter? 'opponent': 'starter'),
    })

    reply.send(questions)
  }

  static async list (request, reply) {
    DuelController.status()
    
    const duels = await Duel.query().select(['id', 'user_turn', 'status', 'updated_at']).where(function(query) {
      query.where('starter_users_id', request.user.id).orWhere('opponent_users_id', request.user.id)
    }).whereNotIn('status', ['waiting', 'matched', 'started']).eager('[starter(defaultSelects), opponent(defaultSelects), details, details.[questions], questions]')

    reply.send(duels)
  }
}

module.exports = DuelController