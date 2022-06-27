import ffcClient, { IOption } from 'ffc-wechat-miniprogram-sdk';

// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    const option: IOption = {
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
})