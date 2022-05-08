## 微信小程序 TypeScript Demo

请前往 miniprogram 文件夹并运行
```typescript
npm i
```

运行前请在小程序微信开发者工具中点击 **工具 -> 构建 npm**

### 本 demo 程序使用了我们创建的环境 secret, 并且使用了两个开关：
- hello: 用于 index 页面，拥有两个返回值
  - true: 首页显示 hello universe
  - false: 首页显示 hello world
- log-title: 用于 logs 页面标题，拥有两个返回值
  - 欢迎访问 log 页: logs 页面标题显示为 **欢迎访问 log 页**
  - 当前为 log 页：logs 页面标题显示为 **当前为 log 页**

#### 您可以将 secret 替换为自己项目环境的 secret, 从而体验操纵 feature flag 带来的乐趣