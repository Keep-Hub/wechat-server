const express = require('express');
const app = express();
const port = 8668;

var bodyParser = require('body-parser')
// 配置 body-parser 中间件（插件，专门用来解析表单 POST 请求体）
// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// 设置跨域
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type,Accept,token");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    if (req.method === 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next();
    }
});
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!已启动`))
const io = require('socket.io')(server)

connections = []
var joinUser = [];
io.on('connection', (socket) => {
    socket.on('setRoom', function (data) {
        joinUser[data._id] = socket.id
        console.log(joinUser);
    });
    socket.on('massage', data => {
        // if(joinUser[data.sendId]) {
        //     io.sockets.connected[joinUser[data.sendId]].emit('getMassage', data)
        // }
        // socket.broadcast.emit('getMassage', data)
        socket.to(joinUser[data.sendId]).emit('getMassage', data)
    })
	connections.push(socket)
	socket.on('disconnect', function (data) {
		connections.splice(connections.indexOf(socket), 1)
		console.log('在线人数', connections.length)
	})
});
app.get('/', (req, res) => res.send('你好!'));

require('./router/index')(app);
//404页面
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err)
});

// 出错处理
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

