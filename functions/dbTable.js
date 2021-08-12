const model = require('../model/dbModel');
const jwt = require('../functions/jwt');
const User = model.user.model('user');
const Relation = model.user.model('relation');
const Code = model.user.model('code');

const randomStr = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
function generateMixedArr(arr, count) {
    let shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}
function generateMixed () {
    let res = ""
    generateMixedArr(randomStr, 24).forEach(item => {
        let id = Math.ceil(Math.random() * 35);
        res += randomStr[id];
    })
    return res
}

// 校验验证码
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

// 注册
function register(res, data) {
    User.find({mail: data.mail}, function (err, val) {
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
                data.openid = generateMixed()
                User.create(data, function (err, val) {
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
// 发送验证码
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
// 登录
function login (res, data) {
    User.find({mail: data.mail, password: data.password}, function (err, val) {
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
                result.token = jwt.createToken(val[0].openid, 1000 * 60 * 60*48)
                res.send(result)
            } else {
                result.code = 2001
                result.message = '邮箱或密码错误，请重新尝试！'
                res.send(result)
            }
        }
    })
}
// 查询好友列表
function friendList(res, data) {
    Relation.aggregate([
        {
            $match: { userId: data.openid}
        },
        {
            $lookup: {
                from: 'user',
                localField: 'friendId', // 和上面的表关联
                foreignField: 'openid', // 和form的表关联
                as: 'friends'
            }
        }
    ], (err, doc) => {
            let result = {
                code: '',
                message: '',
                result: []
            }
        if (err) {
            console.log('err: ', err)
        } else {
            result.code = 2000
            result.message = '获取好友列表成功！'
            result.result = doc
            res.send(result)
        }
    })
}
function verifyBuddy(res, data) {
    Relation.aggregate([
        {
            $match: { userId: data.openid, friendId: data.sendId}
        },
        {
            $lookup: {
                from: 'user',
                localField: 'friendId', // 和上面的表关联
                foreignField: 'openid', // 和form的表关联
                as: 'friends'
            }
        }
    ], (err, doc) => {
        let result = {
            code: '',
            message: '',
            result: {}
        }
        if (err) {
            result.code = 2002
            result.message = '不是好友！' + err
            res.send(result)
        } else {
            if (doc.length > 0) {
                result.code = 2000
                result.message = '获取好友成功！'
                result.result = doc[0].friends[0]
                res.send(result)
            } else {
                result.code = 2001
                result.message = '不是好友！'
                res.send(result)
            }
        }
    })
}
// 发送好友申请
function sendFriendApply (res, data) {
    Relation.find({userId: data.userId, friendId: data.friendId}, function (err, val) {
        if (err) {
            val.send('申请失败！' + err)
        } else {
            let result = {
                code: 2000,
                message: '',
                result: []
            }
            if (val.length > 0) {
                result.code = 2001
                result.message = '已经是好友了！'
                res.send(result)
            } else {
                Relation.create(data, function (err, val) {
                    if (err) {
                        result.message = '好友申请失败！'
                        res.send(err)
                    } else {
                        result.message = '添加好友成功！'
                        res.send(result)
                    }
                })
            }
        }
    })
}
// 查询用户详情
function queryUserDetail (res,data) {
    Relation.aggregate([
        {
            $match: { userId: data.userId, friendId: data.friendId}
        },
        {
            $lookup: {
                from: 'user',
                localField: 'friendId', // 和上面的表关联
                foreignField: 'openid', // 和form的表关联
                as: 'userInformation'
            }
        }
    ], (err, doc) => {
        if (err) {
            console.log('err: ', err)
        } else {
            let result = {
                code: null,
                message: '',
                result: {}
            }
            if (doc.length > 0) {
                result.code = 2000
                result.message = '查询到关系表有！'
                result.isFriend = doc[0].isFriend
                result.result = doc[0].userInformation[0]
                res.send(result)
            } else {
                console.log(666)
                User.find({openid: data.friendId}, function (err, val) {
                    if (err) {
                        val.send('注册失败！' + err)
                    } else {
                        if (val.length > 0) {
                            result.code = 2000
                            result.message = '查询到用户表有！'
                            result.result = val[0]
                            result.isFriend = 0
                            res.send(result)
                        } else {
                            result.code = 2001
                            result.message = '查询用户失败！'
                            res.send(result)
                        }
                    }
                })
            }
        }
    })
}
// 通过好友申请
function ApplyThroughFriend (res, data) {
    Relation.find({userId: data.userId, friendId: data.friendId}, function (err, val) {
        if (err) {
            val.send('申请失败！' + err)
        } else {
            let result = {
                code: 2000,
                message: '',
                result: []
            }
            if (val.length > 0) {
                Relation.findByIdAndUpdate(val[0]._id, {isFriend: data.isFriend}, function (err, val) {
                    if (err) {
                        result.code = 2001
                        result.message = '添加好友失败' + err
                        res.send(result)
                    } else {
                        result.code = 2000
                        result.message = '添加好友成功！'
                        res.send(result)
                    }
                })
            }
        }
    })
}
// 删除好友
function deleteFriend () {

}
exports.Operate = {
    findCode,
    register,
    sendCode,
    login,
    friendList,
    verifyBuddy,
    sendFriendApply,
    queryUserDetail,
    ApplyThroughFriend,
    deleteFriend
}

