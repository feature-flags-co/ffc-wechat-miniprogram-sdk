// app.js
import ffcClient from './ffc-wechat-miniprogram-sdk/index';

App({
  onLaunch() {
    const option = {
      secret: "YThmLWRmZjUtNCUyMDIxMDkxNzA3NTYyMV9fMl9fMjJfXzExNl9fZGVmYXVsdF82NTM3Mg==", // replace with your won secret
      user: {
        id: 'anonymous',
        userName: 'anonymous',
        email: ''
      }
    };

    // initialization client
    ffcClient.init(option);
  },
  globalData: {
    userInfo: null
  }
})
