## 微信小程序 TypeScript Demo

请前往 miniprogram 文件夹并运行
```
npm i
```

运行前请在小程序微信开发者工具中点击 **工具 -> 构建 npm**

### 本 demo 程序使用了我们创建的环境 secret, 并且使用了两个开关：
- hello: 用于 index 页面，拥有两个返回值
  - Universe: 首页显示 hello Universe
  - World: 首页显示 hello World
- counter: 用于控制是否显示 counter 模块，拥有两个返回值
  - true: 开启 counter 模块
  - false：关闭

#### 您可以将 secret 替换为自己项目环境的 secret, 从而体验操纵 feature flag 带来的乐趣