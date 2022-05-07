# [featureflag.co](https://featureflag.co) wechat miniprogram SDK
[Check English version](./README_EN.md)

## Introduction

This SDK has one main work:
- Makes feature flags avaible to wechat miniprogram

## Data synchonization
We use websocket to make the local data synchronized with the server, and then persist in localStorage. Whenever there is any changes to a feature flag, the changes would be pushed to the SDK, the average synchronization time is less than **100** ms. Be aware the websocket connection can be interrupted by any error or internet interruption, but it would be restored automatically right after the problem is gone.

## Offline mode support
As all data is stored locally in the localStorage, in the following situations, the SDK would still work when there is temporarily no internet connection:
- it has already recieved the data from previous conections
- the ffcClient.bootstrap(featureFlags) method is called with all necessary feature flags

In the mean time, the SDK would try to reconnect to the server by an incremental interval, this makes sure that the websocket would be restored when the internet connection is back.

## Evaluation of a feature flag
After initialization, the SDK has all the feature flags locally and it does not need to request the remote server for any feature flag evaluation. All evaluation is done locally and synchronously.

## Getting started
### Install with npm
  ```
  npm install ffc-wechat-miniprogram-sdk
  ```

To import the SDK:
```javascript
// Using ES2015 imports
import ffcClient from 'ffc-wechat-miniprogram-sdk';

// Using TypeScript imports
import ffcClient from 'ffc-js-client-side-sdk';
```
### Install with source code

1. Clone this repository and run the following commands in the root directory
```
npm i
npm run build
```

2. copy the **build** folder to your project and change the folder name to ffc-wechat-miniprogram-sdk

3. import the SDK:
```javascript
// Using ES2015 imports
import ffcClient from 'path to ffc-wechat-miniprogram-sdk';

// Using TypeScript imports
import ffcClient from 'path to ffc-wechat-miniprogram-sdk';
```

### Initializing the SDK
Before initializing the SDK, you need to get the client-side env secret of your environment from our [SaaS platform](https://portal.featureflag.co).

```javascript
import ffcClient from 'ffc-wechat-miniprogram-sdk'; // use path to your sdk if you are not using npm

App({
  globalData: {
  },
  onLaunch() {
    const option = {
      secret: "your env secret",
      user: {
        userName: "the user's user name",
        id: "the user's unique identifier"
      }
    };

    // initialization client
    ffcClient.init(option);

    // set user，this usually happens after login
    const user = {
      "userName": "the user's user name",
      "email": "",
      "id": "the user's unique identifier", // the unique user Id, can be wechat id
      "customizedProperties": [  // any customized properties
      ]
    };

    ffcClient.identify(user);
  },
  ...
})
```

```typescript
import ffcClient, { IOption, IUser } from 'ffc-wechat-miniprogram-sdk'; // use path to your sdk if you are not using npm

App<IAppOption>({
  globalData: {
  },
  onLaunch() {
    const option: IOption = {
      secret: "your env secret",
      user: {
        userName: "the user's user name",
        id: "the user's unique identifier"
      }
    };

    // initialization client
    ffcClient.init(option);

    // set user，this usually happens after login
    const user: IUser = {
      "userName": "the user's user name",
      "email": "",
      "id": "the user's unique identifier", // the unique user Id, can be wechat id
      "customizedProperties": [  // any customized properties
      ]
    };

    ffcClient.identify(user);
  },
  ...
})
```

The complete list of the available parameters in option:
- **secret**: the client side secret of your environment. **mandatory** (NB. this becomes optional if enableDataSync equals false)
- **anonymous**: true if you want to use a anonymous user, which is the case before user login to your APP. If that is your case, the user can be set later with the **identify** method after the user has logged in. The default value is false. **not mandatory**
- **bootstrap**: init the SDK with feature flags, this will trigger the ready event immediately instead of requesting from the remote. **not mandatory**
- **enableDataSync**: false if you do not want to sync data with remote server, in this case feature flags must be set to **bootstrap** option or be passed to the method **bootstrap**. The default value is true. **not mandatory** 
- **api**: the API url of the server, set it only if you are self hosting the back-end. **not mandatory**
- **user**: the user connected to your APP, can be ignored if **anonymous** equals to true. 
  - **userName**: the user name. **mandatory**
  - **id**: the unique identifier. **mandatory**
  - **email**: can be useful when you configure your feature flag rules. **not mandatory**
  - **country**: can be useful when you configure your feature flag rules. **not mandatory**
  - **customizedProperties**: any customized properties you want to send to the back end. It is extremely powerful when you define targeting rules or segments. **not mandatory**
     - it must have the following format:
     ```json
      [{
        "name": "the name of the property",
        "value": "the value of the property"
      }]
     ```

#### Initialization delay
Initializing the client makes a remote request to featureflag.co, so it may take 100 milliseconds or more before the SDK emits the ready event. If you require feature flag values before rendering the page, we recommend bootstrapping the client. If you bootstrap the client, it will emit the ready event immediately.

### Get the varation value of a feature flag
Two methods to get the variation of a feature flag

```javascript
import ffcClient from "ffc-wechat-miniprogram-sdk";

const flagConfigs = [
  { key: 'flagkey', defaultValue: 'default value' }
];

Page({
  data: {
    flagConfigs,
  },
  onLoad() {
    // to use a feature flag
    console.log(this.data.flags['flagkey']);

    // you can always get the value of a flag with the following code
    const variation = ffcClient.variation('flagkey', 'defaultValue');
    // a syntactic sugar exist for boolean value
    // cont variation = ffcClient.boolVariation('flagkey', false);
    console.log(variation);

    // to execute any code when flag value changes
    ffcClient.on(`ff_update:flagkey`, (change: any) => {
      // do your work
      console.log(change.newValue);
    });
  },
  ...
})

// reference a flag in wxml file
<view class="container">
  <view>
    <text>{{flags['flagkey']}}</text>
  </view>
</view>
```

```typescript
import ffcClient, { IFlagConfig } from "ffc-wechat-miniprogram-sdk";

const flagConfigs: IFlagConfig[] = [
  { key: 'flagkey', defaultValue: 'default value' }
];

Page({
  data: {
    flagConfigs,
  },
  onLoad() {
    // to use a feature flag
    console.log(this.data.flags['flagkey']);

    // you can always get the value of a flag with the following code
    const variation = ffcClient.variation('flagkey', 'defaultValue');
    // a syntactic sugar exist for boolean value
    // cont variation = ffcClient.boolVariation('flagkey', false);
    console.log(variation);

    // to execute any code when flag value changes
    ffcClient.on(`ff_update:flagkey`, (change: any) => {
      // do your work
      console.log(change.newValue);
    });
  },
  ...
})

// reference a flag in wxml file
<view class="container">
  <view>
    <text>{{flags['flagkey']}}</text>
  </view>
</view>
```

### bootstrap
If you already have the feature flags available, two ways to pass them to the SDK instead of requesting from the remote.
- By the **init** method
```javascript
  // define the option with the bootstrap parameter
  const option = {
    ...
    bootstrap = [{ // the array should contain all your feature flags
      id: string, // the feature flag key
      variation: string,
      sendToExperiment: boolean, // ignore this for now
      timestamp: number,
      variationOptions: [{
        id: number,
        value: string
      }]
    }]
    ...
  }

  ffcClient.init(option);
```

- By the **bootstrap** method 
```javascript
const featureflags = [{ // the array should contain all your feature flags
  id: string, // the feature flag key
  variation: string,
  sendToExperiment: boolean,
  timestamp: number,
  variationOptions: [{
    id: number,
    value: string
  }]
}]

ffcClient.bootstrap(featureflags);
```

**If you want to disable the synchronization with remote server, set enableDataSync to false in option**. In this case, bootstrap option must be set or bootstrap method must be called with feature flags.

To find out when the client is ready, you can use one of two mechanisms: events or promises.

The client object can emit JavaScript events. It emits a ready event when it receives initial flag values from feature-flags.co. You can listen for this event to determine when the client is ready to evaluate flags.

```javascript
ffcClient.on('ready', (data) => {
  // data has the following structure [ {id: 'featureFlagKey', variation: 'variation value'} ]
  var flagValue = Ffc.variation("YOUR_FEATURE_KEY", 'the default value');
});

```

Or, you can use a promise instead of an event. The SDK has a method that return a promise for initialization: waitUntilReady(). The behavior of waitUntilReady() is equivalent to the ready event. The promise resolves when the client receives its initial flag data. As with all promises, you can either use .then() to provide a callback, or use await if you are writing asynchronous code.

```javascript
ffcClient.waitUntilReady().then((data) => {
  // data has the following structure [ {id: 'featureFlagKey', variation: 'variation value'} ]
  // initialization succeeded, flag values are now available
});
// or, with await:
const featureFlags = await ffcClient.waitUntilReady();
// initialization succeeded, flag values are now available
```

The SDK only decides initialization has failed if it receives an error response indicating that the environment ID is invalid. If it has trouble connecting to feature-flags.co, it will keep retrying until it succeeds.

### Set the user after initialization
If the user parameter cannot be passed by the init method, the following method can be used to set the user after initialization.
```javascript
  ffcClient.identify(user);
```

### Set the user to anonymous user
We can manully call the method logout, which will switch the current user back to anonymous user if exists already or create a new anonymous user.
```javascript
  ffcClient.logout(user);
```

### Subscribe to the changes of feature flag(s)
To get notified when a feature flag is changed, we offer two methods
- subscribe to the changes of any feature flag(s)
```javascript
ffcClient.on('ff_update', (changes) => {
  // changes has this structure [{id: 'the feature_flag_key', oldValue: '', newValue: ''}]
  ...
});

```
- subscribe to the changes of a specific feature flag
```javascript
// replace feature_flag_key with your feature flag key
ffcClient.on('ff_update:feature_flag_key', (change) => {
  // change has this structure {id: 'the feature_flag_key', oldValue: '', newValue: ''}
  const myFeature = Ffc.variation('feature_flag_key', 'default value');
  ...
});

```



