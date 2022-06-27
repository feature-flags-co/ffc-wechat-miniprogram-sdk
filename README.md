# [敏捷开关](https://featureflag.co) 微信小程序 SDK
[Check English version](./README_EN.md)


**[查看 demo](./demos/README.MD)**

**发布小程序前请确保已将 https://api.featureflag.co 添加到小程序合法域名中**

## 概述
SDK 主要完成以下工作:
- 从服务端获取 feature flags 并保持和服务端数据的同步。

## 数据同步
SDK 使用 WebSocket 来保持与服务端的数据同步，从服务端获取的数据均会存入 localStorage。无论何时当任意 feature flag 发生变化时，变更会被接近实时地推送到 SDK，经过测试，同步过程平均耗时少于 **100 ms**。当网络发生中断时 SDK 会尝试以渐增的时间间隔与服务器重新建立连接，及时恢复数据同步。

## 离线模式
SDK 所需的所有数据都存储于本地 localStorage, 因此在没有网络的环境中，满足下述条件之一的情况下，SDK 仍能正常工作：
- SDK 已经从之前的 WebSocket 连接中取得过数据
- ffcClient.bootstrap(featureFlags) 方法被手动调用， 并且 featureFlags 参数包含所有当前使用中的 feature flags

## feature flag 的计算
所有数据都在本地，所有计算过程也都在本地，并且是实时同步计算的。计算过程时间复杂度 O(1), 小于 1 ms。

## 集成 SDK
### 使用 npm
前往 **project.config.json** 文件中 **miniprogramRoot** 参数指定的文件夹并运行如下命令:
  ```
  npm install ffc-wechat-miniprogram-sdk --save
  ```

引入 SDK:
```javascript
import ffcClient from 'ffc-wechat-miniprogram-sdk';
```

### 不使用 npm

1. 从 github 克隆项目到本地
```
git clone https://github.com/feature-flags-co/ffc-wechat-miniprogram-sdk.git

```  

2. 运行如下命令编译代码
```
cd ffc-wechat-miniprogram-sdk
npm i
npm run build
```

3. 将 **dist** 文件夹复制到小程序项目根目录并且重新命名为 ffc-wechat-miniprogram-sdk

4. 引入 SDK:
```javascript
import ffcClient from 'path to ffc-wechat-miniprogram-sdk/index';
```

### 初始化 SDK
初始化之前请确保从[敏捷开关后台](https://portal.featureflag.co)获取对应项目环境的 secret。

```javascript
import ffcClient from 'ffc-wechat-miniprogram-sdk'; // use path to your sdk if you are not using npm

App({
  globalData: {
  },
  onLaunch() {
    const option = { // you can specify the type with IOption if using Typescript
      secret: "your env secret",
      user: {
        userName: "the user's user name",
        id: "the user's unique identifier"
      }
    };

    // initialize client
    ffcClient.init(option);

    // set user，this usually happens after login
    const user = { // you can specify the type with IUser if using Typescript
      "userName": "the user's user name",
      "id": "the user's unique identifier" // the unique user Id, can be wechat id
      ]
    };

    ffcClient.identify(user);
  },
  ...
})
```

以下为完整的参数列表：

- **secret**: 项目环境的 secret. **必填项** (注意: 如果 enableDataSync 设置为false， 则 secret 可以为空)
- **anonymous**: 如果值为 true 则使用匿名用户， 登录之后可以调用 **identify()** 方法来切换用户。默认值为 false. **必填项**
- **bootstrap**: 使用本地 feature flags 初始化 SDK。当提供此参数时将会立即触发 ready event。 **非必填项**
- **enableDataSync**: 如果值为 false 则不会与服务器进行数据同步，这时请确保通过 **bootstrap** 参数提供了所有的 feature flags 或者通过 **bootstrap()** 方法传入所有 feature flags。 默认值为 true。 **非必填项** 
- **api**: 服务端地址，默认值为敏捷开关服务器地址。只有在使用 self-host 服务端时才需要提供此参数。 **非必填项**
- **user**: 当前用户，如果 **anonymous** 参数设置为 true 则 无需提供 user。 
  - **userName**: 用户名. **必填项**
  - **id**: 用户唯一 id. **必填项**
  - **email**: 可以在设置 feature flag 规则时使用，也可以在用户列表中查看。 **非必填项**
  - **country**: 可以在设置 feature flag 规则时使用 **非必填项**
  - **customizedProperties**: 可以是任何希望发送给服务器的用户自定义属性。在定义 feature flag 规则或用户组时将会非常有用。 **非必填项**
     - 必须符合如下数据格式:
     ```json
      [{
        "name": "the name of the property",
        "value": "the value of the property"
      }]
     ```

#### 初始化过程延迟时间
SDK 初始化时会向服务器发送请求并建立 WebSocket 连接， 这个过程耗时 100 毫秒左右。如果希望 feature flags 立即可用，可以在初始化时通过 bootstrap 提供本地 feature flags, 这时会立即触发 ready event。初始化完成后 SDK 会用服务端数据替换本地数据。

### 获取 feature flag 的值
SDK 会将 flagConfigs 中配置的 feature flags 自动生成一个 flags 对象并填充到 Page 或者 Component 的 data 中，JavaScript 代码中引用方式为 **this.data.flags['flagkey']**, wxml 中则可以通过 **flags['flagkey']** 方式引用。

```javascript
import ffcClient from "ffc-wechat-miniprogram-sdk";

// Typescript 类型为 IFlagConfig[]
// 服务端支持直接定义开关返回值类型，defaultValue 应该使用和服务端定义的相同的类型
// 目前支持四种数据类型：string, boolean, number 和 json
const flagConfigs = [
  { key: 'flagkey', defaultValue: defaultValue }
];

// 使用 Page
Page({
  data: {
    flagConfigs,
  },
  onLoad() {
    // 从 data 中获取开关值
    console.log(this.data.flags['flagkey']);

    // 从 SDK 直接获取开关值
    // ffcClient.variation() 和 this.data.flags['flagkey'] 实现相同的效果
    // 服务端支持直接定义开关返回值类型，defaultValue 应该使用和服务端定义的相同的类型
    // 目前支持四种数据类型：string, boolean, number 和 json
    const variation = ffcClient.variation('flagkey', defaultValue);
    console.log(variation);

    // 监听具体某个开关返回值的变化
    ffcClient.on(`ff_update:flagkey`, (change) => {
      // change 的结构为 {id: 'the feature_flag_key', oldValue: old_value, newValue: new_value}
      // 其中 old_value 和 new_value 具有和服务端定义的相同的数据类型
      console.log(change.newValue);
    });
  },
  ...
})

// 使用 Component
Component({
  data: {
    flagConfigs,
  },
  attached() {
    // 从 data 中获取开关值
    console.log(this.data.flags['flagkey']);

    // 从 SDK 直接获取开关值
    // ffcClient.variation() 和 this.data.flags['flagkey'] 实现相同的效果
    // 服务端支持直接定义开关返回值类型，defaultValue 应该使用和服务端定义的相同的类型
    // 目前支持四种数据类型：string, boolean, number 和 json
    const variation = ffcClient.variation('flagkey', defaultValue);
    console.log(variation);

    // 监听具体某个开关返回值的变化
    ffcClient.on(`ff_update:flagkey`, (change) => {
      // change 的结构为 {id: 'the feature_flag_key', oldValue: old_value, newValue: new_value}
      // 其中 old_value 和 new_value 具有和服务端定义的相同的数据类型
      console.log(change.newValue);
    });
  },
  ...
})


// 在 wxml 文件中使用开关，当开关返回值发生变化时，页面内容会自动刷新
<view class="container">
  <view>
    <text>{{flags['flagkey']}}</text>
  </view>
</view>
```


### bootstrap
如果初始化 SDK 之前已经有所有 feature flags，则可以使用以下任意一种方法将其传给 SDK：
- 通过 **init** 方法
```javascript
  // 在 option 中定义初始化开关
  const option = {
    ...
    bootstrap = [{ // the array should contain all your feature flags
      id: string, // the feature flag key
      variation: string,
      sendToExperiment: boolean, // ignore this for now
      timestamp: number,
      variationOptions: [{ // all possible variation of the feature flag
        id: number,
        value: string
      }]
    }]
    ...
  }

  ffcClient.init(option);
```

- 通过 **bootstrap** 方法 
```javascript
const featureflags = [{ // the array should contain all your feature flags
  id: string, // the feature flag key
  variation: string,
  sendToExperiment: boolean,
  timestamp: number,
  variationOptions: [{ // all possible variation of the feature flag
    id: number,
    value: string
  }]
}]

ffcClient.bootstrap(featureflags);
```

**可以将参数 enableDataSync 设置为 false 以停止和服务器间的数据同步**。这时必须提供 bootstrap 参数或者调用 bootstrap() 方法以提供本地版的 feature flags 数据。

可以使用 event 或者 promise 等待 SDK 初始化结束。

SDK 在初始化完成后会自动触发 ready event。可以在代码中监听 ready 事件来确保获取开关值之前本地已经取得数据。

```javascript
ffcClient.on('ready', (data) => {
  // data 的结构为 [ {id: 'featureFlagKey', variation: variation_value} ]
  // variation_value 具有和服务端定义的相同的数据类型
  var flagValue = Ffc.variation("YOUR_FEATURE_KEY", 'the default value');
});

```

或者也可以使用 promise。SDK 提供了 waitUntilReady() 方法，和 ready 事件实现相同的效果，但是提供了 promise API, 同时支持使用 await。

```javascript
ffcClient.waitUntilReady().then((data) => {
  // data 的结构为 [ {id: 'featureFlagKey', variation: variation_value} ]
  // variation_value 具有和服务端定义的相同的数据类型
  // 初始化完成，可以正常使用开关
});
// 或者，使用 await:
const featureFlags = await ffcClient.waitUntilReady();
// 初始化完成，可以正常使用开关
```

### 初始化结束之后切换用户
如果初始化时使用了匿名用户，登录后我们往往需要切换到登录后的用户，这时可以使用 identity() 方法来切换用户。
```javascript
  ffcClient.identify(user);
```

### 重新切换为匿名用户
当用户退出账户时可以调用 logout() 方法重新切换为匿名用户。
```javascript
  ffcClient.logout(user);
```

### 监听 feature flag 变更事件
SDK 提供了两种方法来监听 feature flag 变更事件：
- 监听所有 feature flags 的变动
```javascript
ffcClient.on('ff_update', (changes) => {
  // change 的结构为 [{id: 'the feature_flag_key', oldValue: old_value, newValue: new_value}]
  // 其中 old_value 和 new_value 具有和服务端定义的相同的数据类型
  ...
});

```
- 监听某个具体 feature flag 的变动
```javascript
// 将 feature_flag_key 替换为自己开关的 key
ffcClient.on('ff_update:feature_flag_key', (change) => {
  /// change 的结构为 {id: 'the feature_flag_key', oldValue: old_value, newValue: new_value}
  // 其中 old_value 和 new_value 具有和服务端定义的相同的数据类型
  ...
});

```
