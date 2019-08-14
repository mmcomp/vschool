'use strict'

const randomatic = require('randomatic')
const axios = require('axios')
const User = require('../models/user.model.js')

class OtpController {
  static async requestOtp(request, reply) {
    const mobile = request.params.mobile
    // const user = await User.query().where('mobile', mobile).first()
    // if(!user) {
    //   return false
    // }
    const otp = randomatic('0', 4)

    User.query().where('id', request.user.id).update({
      otp,
      mobile
    }).then(result => {
      console.log('Set Otp Result', result)
    }).catch(e => {
      console.log('Set Otp Error', e)
    })

    axios({
      method: 'get',
      url: process.env.SMS_KAVENEGAR_URL + process.env.SMS_KAVENEGAR_API_KEY + '/verify/lookup.json?receptor=' + mobile.replace('+98','0')
      + '&token=' + otp + '&template=' + process.env.SMS_KAVENEGAR_TEMPLATE + '&',
    }).then(result => {
      console.log('Send Otp Result', result.data)
    }).catch(e => {
      console.log('Send Otp Error', e)
    })

    reply.send()
  }
}

module.exports = OtpController