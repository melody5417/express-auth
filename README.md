* 安装依赖

```
npm install
```

* 启动服务

```
nodemon server.js
```

* 测试test.http文件的接口

* 静态文件托管 (https://www.bilibili.com/video/BV1gt411S7ah)

创建public文件夹，存储例如html等静态资源。
通过中间件，可以直接或间接访问资源

* CORS 跨域问题解决
跨域总体思想：
server是运行在4000端口，
home.html通过插件 Live Server 打开(安装插件后，按住文件右键菜单用插件打开)，可以新起一个服务，在其他端口打开，
这样在home.html里添加调用访问server的服务就是跨端口，也就跨域了。

解决：安装npm包 cors

* mongodb 相关操作
安装依赖
```
npm i mongoose --save
```

put 整条记录覆盖
patch 部分修改
