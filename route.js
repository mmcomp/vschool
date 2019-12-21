'use strict'

const User = require('./models/user.model.js')
const UserController = require('./controllers/user.controller')
const OtpController = require('./controllers/otp.controller')
const CourseController = require('./controllers/course.controller')
const ChapterController = require('./controllers/chapter.controller')
const LessonController = require('./controllers/lesson.controller')
const DuelController = require('./controllers/duel.controller')
const QuestionController = require('./controllers/question.controller')
const PageController = require('./controllers/page.controller')

async function routes (fastify, options) {
  // Open
  fastify.post('/api/signin', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            minLength: 3
          },
          password: {
            type: 'string',
            minLength: 3
          }
        }
      }
    }
  }, async (request, reply) => {
    const {email, password} = request.body
    const user = await User.query().where('email', email).first()
    if(user && await user.verify(password)) {
      const token = fastify.jwt.sign(user.toJSON())
      reply.code(202).send({
        name: user.fname + ' ' + user.lname,
        email: user.email,
        mobile: user.mobile,
        token
      })  
    }else {
      reply.code(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "ایمیل یا رمز عبور اشتباه است"
      })
    }
  })

  fastify.post('/api/signup', async (request, reply) => {
    const user = await User.createGuestUser()

    const token = fastify.jwt.sign(user.toJSON())
    reply.code(201).send({
      key: `${user.id}|${user.password}`,
      token
    })
  })

  fastify.post('/api/token', {
    schema: {
      body: {
        type: 'object',
        required: ['key'],
        properties: {
          key: {
            type: 'string',
            minLength: 10
          }
        }
      }
    }
  },async (request, reply) => {
    const { key } = request.body
    const user_id = parseInt(key.split('|')[0], 10)
    const user = await User.query().where('id', user_id).first()

    if(!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "کلید مورد نظر پیدا نشد"
      })
    }
    const token = fastify.jwt.sign(user.toJSON())
    reply.code(200).send({
      token
    })
  })
  // Auth
  fastify.get('/api/', {
    preValidation: [fastify.authenticate]
  }, UserController.test)

  // User
  fastify.post('/api/profile', {
    schema: {
      body: {
        type: 'object',
        required: ['otp'],
        properties: {
          mobile: {
            type: 'string',
            minLength: 5
          }
        }
      }
    },
    preValidation: [fastify.authenticate]
  }, UserController.profile)

  fastify.get('/api/otp/:mobile' , {
    preValidation: [fastify.authenticate]
  } , OtpController.requestOtp)

  fastify.get('/api/user/pass_page/:pages_id', {
    preValidation: [fastify.authenticate]
  }, UserController.passPage)

  fastify.post('/api/pushid', {
    schema: {
      body: {
        type: 'object',
        required: ['push_id'],
        properties: {
          push_id: {
            type: 'string',
            minLength: 5
          }
        }
      }
    },
    preValidation: [fastify.authenticate]
  }, UserController.setPushId)

  // Course  
  fastify.get('/api/course/chapters/:courses_id', {
    preValidation: [fastify.authenticate]
  }, CourseController.courseChapters)

  fastify.get('/api/course/chapters', {
    preValidation: [fastify.authenticate]
  }, CourseController.chapters)

  fastify.get('/api/course/map/:courses_id', {
    preValidation: [fastify.authenticate]
  }, CourseController.map)


  fastify.get('/api/course/preview/:courses_id', CourseController.preview)

  fastify.get('/api/course/:education_level', {
    preValidation: [fastify.authenticate]
  }, CourseController.courseOfEducationLevel)

  fastify.get('/api/course', {
    preValidation: [fastify.authenticate]
  }, CourseController.index)

  // Chapter
  fastify.get('/api/chapter/lessons/:chapters_id', {
    preValidation: [fastify.authenticate]
  }, ChapterController.chapterLessons)

  fastify.get('/api/chapter/lessons', {
    preValidation: [fastify.authenticate]
  }, ChapterController.lessons)

  fastify.get('/api/chapter/exam/:chapters_id', {
    preValidation: [fastify.authenticate]
  }, ChapterController.exam)
  
  fastify.get('/api/chapter', {
    preValidation: [fastify.authenticate]
  }, ChapterController.index)

  // Lesson
  fastify.get('/api/lesson/pages/:lessons_id', {
    preValidation: [fastify.authenticate]
  }, LessonController.lessonPages)

  fastify.get('/api/lesson/pages', {
    preValidation: [fastify.authenticate]
  }, LessonController.pages)

  fastify.get('/api/lesson', {
    preValidation: [fastify.authenticate]
  }, LessonController.index)

  // Question
  fastify.get('/api/question/:id', QuestionController.load)

  // Page
  fastify.get('/api/page/:id', PageController.load)

  // Duel
  fastify.get('/api/duel/start', {
    preValidation: [fastify.authenticate]
  }, DuelController.start)

  // Admin
  fastify.get('/', (request, reply) => {
    reply.render('index.pug');
  });
}

module.exports = routes