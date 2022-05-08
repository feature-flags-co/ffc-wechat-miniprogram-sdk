// logs.ts
import ffcClient, { IFeatureFlagChange, IFlagConfig } from 'ffc-wechat-miniprogram-sdk';
// const util = require('../../utils/util.js')
import { formatTime } from '../../utils/util'

const flagConfigs: IFlagConfig[] = [
  { key: 'log-title', defaultValue: '当前为log页' }
];

Component({
  data: {
    flagConfigs,
    logs: [],
  },
  attached() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map((log: string) => {
        return {
          date: formatTime(new Date(log)),
          timeStamp: log
        }
      }),
    })

    ffcClient.on(`ff_update:log-title`, (change: IFeatureFlagChange) => {
      // 任何需要在 feature flag 发生变化后执行的代码
      console.log(change.newValue);
    });
  },
})
