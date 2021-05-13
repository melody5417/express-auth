const { User, Token } = require('./models') // 解构，点击User 按住cmd 可以查看类型
const express = require('express');
const jwt = require('jsonwebtoken');

const APP_KEY = 'fwjefpowj'; // appkey 应该写在config或者env文件里
const TOKEN_VALID_DURATION = 60 * 1000;    // token有效期（单位ms，测试数据），应该写在config或者env文件里

const app = express()

app.use(express.json())

app.get('/', async (req, res) => {
    res.send('OK');
})

app.get('/api/users', async (req, res) => {
    const users = await User.find()
    res.send(users);
})

const auth = async (req, res, next) => {
    // token -> id -> User
    const token = String(req.headers.authorization).split(' ').pop()
    const tokenData = jwt.verify(token, APP_KEY);
    const user = await User.findById(tokenData.id)
    req.user = user
    next();
}

app.get('/api/profile', auth, async (req, res) => {
    res.send(req.user);
})

app.post('/api/register', async (req, res) => {
    const user = await User.create({
        username: req.body.username,
        password: req.body.password
    })
    res.send(user)
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        username: req.body.username
    })
    if (!user) {
        res.status(422).send({
            errMsg: '用户名不存在'
        });
    }

    const isPasswordValid = require('bcrypt').compareSync(
        req.body.password,
        user.password,
    );
    if (!isPasswordValid) {
        res.status(422).send({
            errMsg: '密码错误'
        });
    }

    // 4 生成 token

    // 4.1 查找uid对应的所有token
    const tokens = await Token.find({
        uid: user._id,
    })

    // 4.2 遍历所有已登录token记录. 如果已经过期就删掉；没有过期就标记被踢掉
    const validStartTime = Date.now() - TOKEN_VALID_DURATION;
    tokens.forEach(async item => {
        if (item.updatetime < validStartTime) {
            // 已过期，删掉过期token
            await Token.deleteOne({
                _id: item._id
            })
        } else {
            // 被踢掉，更新状态
            await Token.updateOne({
                _id: item._id
            }, {
                status: 1
            })
        }
    })

    // 4.3 插入本次登录的token记录
    const updateTime = Date.now()
    const token = jwt.sign({
        id: user._id
    }, APP_KEY);
    const tokenModel = await Token.create({
        token: token,
        uid: user._id,
        status: 0,
        updatetime: updateTime
    })
    res.send({
        user,
        token: token
    });
})

app.listen(3001, () => {
    console.log('http://localhost:3001')
})