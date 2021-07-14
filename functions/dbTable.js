const model = require('../model/dbModel');
const jwt = require('../functions/jwt');
const Test = model.user.model('user');
const Code = model.user.model('code');
const buddy_list = model.user.model('buddy_list');
function findCode(res, data) {
    Code.find({mail: data.mail, code: data.code}, (err, val) => {
        let result = {
            code: '',
            message: '',
            result: []
        }
        if (err) {
            res.send(err)
        } else {
            if (val !== undefined && val.length !== 0) {
                result.code = 2000
                result.message = '验证成功'
                res.send(result)
            } else {
                result.code = 2001
                result.message = '验证码错误'
                res.send(result)
            }
        }
    })
}
function register(res, data) {
    Test.find({mail: data.mail}, function (err, val) {
        if (err) {
            val.send('注册失败！' + err)
        } else {
            let result = {
                code: 2000,
                message: '',
                result: []
            }
            if (val.length > 0) {
                result.code = 2001
                result.message = '该邮箱已经注册过！'
                res.send(result)
            } else {
                Test.create(data, function (err, val) {
                    if (err) {
                        result.message = '注册失败！'
                        res.send(err)
                    } else {
                        result.message = '注册成功！'
                        res.send(result)
                    }
                })
            }
        }
    })
}
function sendCode(res, data) {
    Code.find({mail: data.mail}, function (err, val) {
        if (err) {
            val.send('验证码发送失败！' + err)
        } else {
            let result = {
                code: '',
                message: '',
                result: []
            }
            if (val.length > 0) {
                Code.findByIdAndUpdate(val[0]._id, {code: data.code, updateTime: data.updateTime}, function (err, val) {
                    if (err) {
                        result.code = 2001
                        result.message = '验证码发送失败' + err
                        res.send(result)
                    } else {
                        result.code = 2000
                        result.message = '验证码发送成功 请前往邮箱查看！'
                        res.send(result)
                    }
                })
            } else {
                Code.create(data, function (err, val) {
                    if (err) {
                        result.code = 2001
                        result.message = '验证码发送失败' + err
                        res.send(result)
                    } else {
                        result.code = 2000
                        result.message = '验证码发送成功 请前往邮箱查看！'
                        res.send(result)
                    }
                })
            }
        }
    })
}
function login (res, data) {
    Test.find({mail: data.mail, password: data.password}, function (err, val) {
        let result = {
            code: '',
            message: '',
            result: val
        }
        if (err) {
            result.code = 2001
            result.message = '登录失败！' + err
            res.send('登录失败！' + err)
        } else {
            if (val.length > 0) {
                result.code = 2000
                result.message = '登录成功！'
                result.token = jwt.createToken(val[0]._id, 1000 * 60 * 60)
                res.send(result)
            } else {
                result.code = 2001
                result.message = '邮箱或密码错误，请重新尝试！'
                res.send(result)
            }
        }
    })
}
function buddyList(res, data) {
    buddy_list.find({userId: data._id}, function (err, val) {
        let result = {
            code: '',
            message: '',
            result: val
        }
        if (err) {
            result.code = 2002
            result.message = '获取好友列表失败！' + err
            res.send(result)
        } else {
            if (val.length > 0) {
                result.code = 2000
                result.message = '获取好友列表成功！'
                res.send(result)
            } else {
                result.code = 2001
                result.message = '暂无好友！'
                res.send(result)
            }
        }
    })
}
function verifyBuddy(res, data) {
    buddy_list.find({userId: data._id,buddyId: data.sendId}, function (err, val) {
        let result = {
            code: '',
            message: '',
            result: val
        }
        if (err) {
            result.code = 2002
            result.message = '不是好友！' + err
            res.send(result)
        } else {
            if (val.length > 0) {
                result.code = 2000
                result.message = '获取好友成功！'
                res.send(result)
            } else {
                result.code = 2001
                result.message = '不是好友！'
                res.send(result)
            }
        }
    })
}
exports.Test = {
    findCode,
    register,
    sendCode,
    login,
    buddyList,
    verifyBuddy
}

