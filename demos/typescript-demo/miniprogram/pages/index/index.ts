import ffcClient, { IFlagConfig } from "ffc-wechat-miniprogram-sdk";

const flagConfigs: IFlagConfig[] = [
  { key: 'hello', defaultValue: false },
  { key: 'counter', defaultValue: 'false' },
];

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
    console.log('loading');
    ffcClient.on('ff_update:hello', (change: any) => {
      console.log(change);
    })
  }
})
