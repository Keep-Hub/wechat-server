// token
const jwt = require("jsonwebtoken");
const secret = "keep_server"; // 解析加密的字符串

let createToken = (data, expiresIn) => {
    console.log(data);
    let obj = {};
    obj.data = data || {};
    obj.createTime = (new Date()).getTime();
    obj.expiresIn = expiresIn;
    return jwt.sign(obj,secret);
}

let verifyToken = (token) => {
    let res = {
        code: 0,
        result: [],
        message: ''
    }
    try{
        let {data, createTime, expiresIn} = jwt.verify(token,secret);
        let nowTime = (new Date()).getTime();
        if(nowTime - createTime < expiresIn){
            res.code = 2000
            res.message = '登录生效中'
            res.result = {id: data, createTime: createTime, expiresIn: expiresIn};
        } else {
            res.code = 2001
            res.message = '登录失效，请重新登录'
        }
    } catch(error){
        res.code = 2001
        res.message = error
    }
    return res;
}

module.exports = {
    createToken,
    verifyToken
};
