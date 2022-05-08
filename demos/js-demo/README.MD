## Wechat Miniprogram JavaScript Demo

Before running this demo, please build the SDK and copy all files under **build** folder to **ffc-wechat-miniprogram-sdk** folder under js-demo.

### This demo used our created environment secret, and used two feature flags：

- hello: used in **index** page，has two variations
  - true: display **hello universe**
  - false: display **hello world**
- log-title: used in logs page，has two variations
  - 欢迎访问 log 页: display **欢迎访问 log 页**
  - 当前为 log 页: display **当前为 log 页**

#### Please replace the secret with your own environment secret to enjoy the fun with feature flags