// 引用nodemailer 发送邮件
const nodemailer = require("nodemailer");
const credentials = require("../config/credentials");
let dbtable = require('../functions/dbTable').Operate

//
let transporter = nodemailer.createTransport({
        host: 'smtp.qq.com', // 这是腾讯的邮箱 host
        port: 465, // smtp 端口
        secureConnection: true,
        auth: {
            user: credentials.qq.user,
            pass: credentials.qq.pass,
        },
    });
function randomCode(email, code) {
    return '<div style="font-size: 36px">'
            + '你好，这个是测试文案请忽略 谢谢 ：验证码为'+
            '<span style="color: #409EFF">'
            + code +
            '</span>'+
            '</div>'
}
exports.emailSignUp = function (email, res) {
    // 生成随机验证码
    let code = Math.floor(Math.random() * (9999 - 1000))+ 1000;
    let options = {
        from: '1427316264@qq.com',
        to: email,
        subject: '测试号 ',
        html: randomCode(email, code)
    };
    transporter.sendMail(options, function (err, msg) {
        if (err) {
            console.log(err);
        } else {
            dbtable.sendCode(res, {mail: email, code: code, createTime: new Date(), updateTime: new Date()})
        }
    })
}
