// app.js
import ffcClient from './ffc-wechat-miniprogram-sdk/index';

App({
  onLaunch() {
    const option = {
      secret: "YThmLWRmZjUtNCUyMDIxMDkxNzA3NTYyMV9fMl9fMjJfXzExNl9fZGVmYXVsdF82NTM3Mg==", // replace with your won secret
      anonymous: true
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
        // 发送 res.code 到后台换取 openId, sessionKey, unionId

        // 切换用户，通常这一步会在登录后被调用
        ffcClient.identify({
          "userName": "sdk-sample-miniprogram",
          "email": "",
          "id": "sdk-sample-miniprogram", // 项目环境内用户唯一Id
          "customizedProperties": [  // 用户自定义属性
          ]
        });
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
