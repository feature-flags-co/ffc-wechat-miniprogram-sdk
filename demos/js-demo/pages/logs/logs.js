// logs.js
import ffcClient from '../../ffc-wechat-miniprogram-sdk/index';

const util = require('../../utils/util.js')

const flagConfigs = [
  { key: 'log-title', defaultValue: '当前为log页' }
];

Page({
  data: {
    flagConfigs,
    logs: []
  },
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      })
    })

    ffcClient.on(`ff_update:log-title`, (change) => {
      // 任何需要在 feature flag 发生变化后执行的代码
      console.log(change.newValue);
    });
  }
})
