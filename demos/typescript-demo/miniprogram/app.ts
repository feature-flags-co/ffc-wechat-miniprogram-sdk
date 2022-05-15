import ffcClient, { IOption, IUser } from 'ffc-wechat-miniprogram-sdk';
//import ffcClient, { IOption, IUser } from './miniprogram_npm/ffc-wechat-miniprogram-sdk';

// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    const option: IOption = {
      secret: "YThmLWRmZjUtNCUyMDIxMDkxNzA3NTYyMV9fMl9fMjJfXzExNl9fZGVmYXVsdF82NTM3Mg==", // replace with your won secret
      anonymous: true,
      api: "https://api-dev.featureflag.co"
    };

    // initialization client
    ffcClient.init(option);

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId

        // 切换用户，通常这一步会在登录后被调用
        ffcClient.identify({
          "userName": "sdk-sample-miniprogram",
          "email": "",
          "id": "sdk-sample-miniprogram", // 项目环境内用户唯一Id
          "customizedProperties": [  // 用户自定义属性
          ]
        });
      },
    })
  },
})