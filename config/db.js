let mongoose = require('mongoose');
let db = mongoose.createConnection('mongodb://localhost:27017/Test',{ useNewUrlParser: true ,useUnifiedTopology: true });

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.info('连接数据库成功')
});

module.exports = db;
