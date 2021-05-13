const { User } = require('./models') // 解构，点击User 按住cmd 可以查看类型
const express = require('express');
const jwt = require('jsonwebtoken');

const APP_KEY = 'fwjefpowj'; // appkey 应该写在config或者env文件里

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

    // 生成 token
    const token = jwt.sign({
        id: user._id
    }, APP_KEY); 

    res.send({
        user,
        token: token
    });
})

app.listen(3001, () => {
    console.log('http://localhost:3001')
})