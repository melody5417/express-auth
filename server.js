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
    const token = String(req.headers.authorization).split(' ').pop()

    // 1. 校验token是否存在
    const tokenModel = await Token.findOne({ token })
    if (!tokenModel) {
        res.status(422).send({
            errMsg: 'token不存在'
        });
    }

    // 2. 校验uid是否匹配
    // token -> id -> User
    const tokenData = jwt.verify(token, APP_KEY);
    if (tokenData.id !== tokenModel.uid) {
        res.status(422).send({
            errMsg: 'user id is not matched'
        });
    }

    // 3. 根据uid查找用户，判断用户是否存在，可能离职啥的
    const user = await User.findById(tokenData.id)
    if (!user) {
        res.status(422).send({
            errMsg: 'user is not found'
        });
    }

    // 4. 校验token状态，是否为踢掉
    if (token.status === 1) {
        res.send({
            errMsg: 'user login at other computer'
        });
    }

    // 5. 校验token有效期，过期则删掉返回
    const duration = Date.now() - tokenModel.updatetime
    if (duration > TOKEN_VALID_DURATION) {
        await Token.deleteOne({ _id: tokenModel._id })
        res.send({
            errMsg: 'token has expired'
        });
    }

    // 6. 判断接口是否具有自动续期token权限，如果支持续期，则token续期
    if (req.autoRenew) {
        await Token.updateOne({
            _id: tokenModel._id
        }, {
            updatetime: Date.now()
        })
    }

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