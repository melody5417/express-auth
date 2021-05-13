* [1小时搞定NodeJs(Express)的用户注册、登录和授权](https://www.bilibili.com/video/BV1Nb411j7AC)

* 安装依赖
```
npm i express@next // 一定要装5.+版本，因为要支持async/await
npm i mongoose // 用它来操作mongodb数据库
npm i -g nodemon // 用来起node服务
``` 
* 写代码
```
// server.js
// 创建server，并监听
// 写路由
```
* 启动服务
```
nodemon server.js
```

* 安装vscode插件 REST Client

类似于postman， 用代码的形式发起请求，更方便一些。

* 创建 test.http 测试接口

这里注意定义变量时不能写字符串

* 添加登录和注册

注意json头格式
接口一般都会带个前缀，比如api

* 定义数据库 
为了解耦逻辑，再创建一个model.js, 因为数据库里都要定义模型来操作。
mongodb 的一个优点，不需要提前创建数据库表等，直接连接，如果没有会自动创建。
```
 mongod --dbpath . // 启动服务  需要指定数据库所在位置
```
密码明文存储: 不可逆加密，加盐加密，``` npm i bcrypt```
昵称唯一 unique

* token
``` npm i jsonwebtoken ```

* auth 中间件