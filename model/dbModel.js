let mongoose = require('mongoose');
mongoose.set('useFindAndModify', false)
let db = require('../config/db');
let Schema = mongoose.Schema;
// 用户表
let SchemaUser = new Schema({
    mail: String,
    openid: String,
    nickName: String,
    avatar: String,
    password: String,
    createTime: Date
});
// 用户关系表
let SchemaRelation = new Schema({
    userId: String,
    friendId: String,
    isFriend: {
        type: Number,
        default: 0
    },
    remark: String,
    label: String,
    isBlack: {
        type: Number,
        default: 0
    },
    isStar: {
        type: Number,
        default: 0
    },
    createTime: Date,
    updateTime: Date
})
// 邮箱验证码表
let SchemaCode = new Schema({
    mail: String,
    code: Number,
    createTime: Date,
    updateTime: Date,
});
let user = db.model('user', SchemaUser, 'user');
let relation = db.model('relation', SchemaRelation, 'relation');
let code = db.model('code', SchemaCode, 'code');
let buddy_list = db.model('buddy_list', SchemaCode, 'buddy_list');
module.exports = {
    user,
    relation,
    code,
    buddy_list
};
