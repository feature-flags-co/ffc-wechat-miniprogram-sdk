// index.js
import ffcClient from "../../ffc-wechat-miniprogram-sdk/index";

const flagConfigs = [
  { key: 'hello', defaultValue: false },
  { key: 'counter', defaultValue: 'false' },
];

// 获取应用实例
const app = getApp()

Page({
  data: {
    flagConfigs,
    userName: ''
  },
  // 事件处理函数
  bindViewTap() {
    (async () => {
      await ffcClient.identify({
        "userName": "小明",
        "email": "",
        "id": "123456", // 项目环境内用户唯一Id
        "customizedProperties": [  // 用户自定义属性
        ]
      });

      this.setData({
        "userName": ffcClient.getUser().userName
      });
    })();
  },
  onLoad() {
    this.setData({
      "userName": ffcClient.getUser().userName
    });

    // 监听开关变化
    ffcClient.on('ff_update:hello', (change) => {
      console.log(change);
    })
  }
})
