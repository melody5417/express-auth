const mongoose = require('mongoose');

// 连接字符串
mongoose.connect('mongodb://localhost:27017/express-auth', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
});

const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: String, set(val) {
        return require('bcrypt').hashSync(val, 10);
    }}
});
const User = mongoose.model('User', UserSchema);

const TokenSchema = new mongoose.Schema({
    token: {type: String},
    uid: {type: String},
    status: {type: Number}, // 0-normal, 1-kicked
    updatetime: {type: Number}, // 时间戳
});
const Token = mongoose.model('Token', TokenSchema);

// exports {} 方便再增加模型
module.exports = { User, Token }