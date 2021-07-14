let mongoose = require('mongoose');
mongoose.set('useFindAndModify', false)
let db = require('../config/db');
let Schema = mongoose.Schema;
// 用户表
let SchemaUser = new Schema({
    mail: String,
    nickName: String,
    password: String,
    createTime: Date
});
// 邮箱验证码表
let SchemaCode = new Schema({
    mail: String,
    code: Number,
    createTime: Date,
    updateTime: Date,
});
let user = db.model('user', SchemaUser, 'user');
let code = db.model('code', SchemaCode, 'code');
let buddy_list = db.model('buddy_list', SchemaCode, 'buddy_list');
module.exports = {
    user,
    code,
    buddy_list
};
