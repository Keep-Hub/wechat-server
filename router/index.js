let dbtable = require('../functions/dbTable').Test
let mailServer = require('../functions/mailServer')
const jwt = require('../functions/jwt');

module.exports = function (app) {
    app.get('/checkCode',(req, res) => {
        dbtable.findCode(res, req.query)
    });
    // 注册
    app.post('/register',(req, res) => {
        let nowTime = new Date()
        let data = Object.assign(req.body, {createTime: nowTime})
        dbtable.register(res, data)
    });
    // 发送邮箱验证
    app.post('/mail',(req, res) => {
        mailServer.emailSignUp(req.body.mail, res)
    });
    // 登录
    app.post('/login',(req, res) => {
        console.log(req.body);
        dbtable.login(res, req.body)
    });
    // 获取好友列表
    app.post('/getBuddyList',(req, res) => {
        dbtable.buddyList(res, req.body)
    });
    // 获取验证好友
    app.post('/getVerifyBuddy',(req, res) => {
        dbtable.verifyBuddy(res, req.body)
    });
    // 测试token
    app.post('/testToken',(req, res) => {
        res.send(jwt.verifyToken(req.body.token),)
    });
};
