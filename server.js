const express = require('express');
const { Product } = require('./model');

const app = express()

app.use(express.json());

/**
 * 所有public文件夹下的静态文件可以被访问
 * 举例：
 * 浏览器打开 http://localhost:4000/home.html
 */
// app.use(express.static('public'));

/**
 * 重定义静态资源的路由为 /static
 * 举例： 
 * 浏览器打开 http://localhost:4000/static/home.html
 */
app.use('/static', express.static('public'));

/**
 * 解决跨域
 */
app.use(require('cors')());

// 测试数据
// Product.insertMany([
//     {title: 'title1'},
//     {title: 'title2'},
//     {title: 'title3'}
// ])


app.get('/', (req, res) => {
    res.send({
        'username': 'user1',
        'passworf': '123456'
    });
})

app.get('/getProducts', async (req, res) => {
    // const products = await Product.find();

    // const products = await Product.find().limit(2);

    // const products = await Product.find().where({
    //     _id : '609d1ced8c76f88796b51af5'
    // });

    // 排序参数 1-正序 (-1)-倒序
    const products = await Product.find().sort({_id: -1});
    res.send(products);
})

// ：捕获任意字符 req.params.id
app.get('/getProduct/:id', async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    res.send(product);
})

app.post('/addProduct', async (req, res) => {
    const params = req.body;
    console.log(req.body);
    const product = await Product.create({
        title: params.title
    });
    res.send(product);
})

app.put('/product/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    product.title = req.body.title;
    await product.save()
    res.send('OK');
})

app.listen(4000, () => {
    console.log('http://localhost:4000')
})