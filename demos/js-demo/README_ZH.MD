## 微信小程序 JavaScript Demo

运行前请重新编译 SDK, 并将编译后 build 文件夹内的文件复制到 js-demo 中 ffc-wechat-miniprogram-sdk 文件夹下。

### 本 demo 程序使用了我们创建的环境 secret, 并且使用了两个开关：
- hello: 用于 index 页面，拥有两个返回值
  - true: 首页显示 hello universe
  - false: 首页显示 hello world
- log-title: 用于 logs 页面标题，拥有两个返回值
  - 欢迎访问 log 页: logs 页面标题显示为 **欢迎访问 log 页**
  - 当前为 log 页：logs 页面标题显示为 **当前为 log 页**

#### 您可以将 secret 替换为自己项目环境的 secret, 从而体验操纵 feature flag 带来的乐趣