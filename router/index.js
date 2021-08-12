const dbtable = require('../functions/dbTable').Operate
const mailServer = require('../functions/mailServer')
const jwt = require('../functions/jwt');
const multer = require('multer')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')


let createFolder = function(folder){
    try{
        fs.accessSync(folder);
    }catch(e){
        fs.mkdirSync(folder);
    }
};
let uploadFolder = './filePath/';
createFolder(uploadFolder);
// 通过 filename 属性定制
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 保存的路径
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        // 保存文件的后缀
        let  newSuffix = file.originalname.lastIndexOf('.')
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, file.fieldname + '-' + Date.now() + file.originalname.substr(newSuffix));
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
let upload = multer({ storage: storage })


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
    app.post('/getFriendList',(req, res) => {
        dbtable.friendList(res, req.body)
    });
    // 获取验证好友
    app.post('/getVerifyBuddy',(req, res) => {
        dbtable.verifyBuddy(res, req.body)
    });
    // 发送好友验证
    app.post('/sendFriendApply',(req, res) => {
        dbtable.sendFriendApply(res, req.body)
    });
    // 通过好友申请
    app.post('/ApplyThroughFriend',(req, res) => {
        dbtable.ApplyThroughFriend(res, req.body)
    });
    // 查询用户信息详情
    app.post('/queryUserDetail',(req, res) => {
        dbtable.queryUserDetail(res, req.body)
    });
    app.post('/sendUploadFile', upload.single('file'),async (req, response) => {
        let file = req.file;
        // console.log(file);
        // console.log('文件类型：%s', file.mimetype);
        // console.log('原始文件名：%s', file.originalname);
        // console.log('文件大小：%s', file.size);
        // console.log('文件保存路径：%s', file.path);
        let result = {
            thumbnail: '',
            normogram: '',
            duration: ''
        }
        let videoUrl = 'http://10.10.20.128:8668/' + file.path.replace(/\\/g,"/")
        if (req.body.fileType === '3') {
            let ff = new ffmpeg({source: file.path})
            ff.ffprobe(function (err, res) {
                if (err) {
                    console.error(err);
                } else {
                    res.streams.forEach(item => {
                        if (item.width && item.height) {
                            console.log(item.width);
                            console.log(item.height);
                            ff.screenshots({
                                count: 1,
                                timemarks: ['0.01'],
                                filename: '%b_screenshots',
                                size: Math.round(item.width/4) + 'x' + Math.round(item.height/4)
                            }, 'imagePath').on('end', function (err, callback) {
                                let splitStart = callback.split('\'imagePath\\')[1]
                                let splitEnd = 'imagePath/' + splitStart.split('\':')[0]
                                result.thumbnail = 'http://10.10.20.128:8668/' + splitEnd
                                result.duration =  item.duration
                                result.normogram = videoUrl
                                response.send(result)
                            })
                        }
                    })
                }
            })
        } else {
            result.normogram = videoUrl
            response.send(result)
        }
    });
    // 测试token
    app.post('/testToken',(req, res) => {
        res.send(jwt.verifyToken(req.body.token),)
    });
};
