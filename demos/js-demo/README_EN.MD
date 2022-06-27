## Wechat Miniprogram JavaScript Demo

Before running this demo, please build the SDK and copy all files under **build** folder to **ffc-wechat-miniprogram-sdk** folder under js-demo.

### This demo used our created environment secret, and used two feature flags：

- hello: used in **index** page，has two variations
  - Universe: display **hello Universe**
  - World: display **hello world**
- counter: used to control **counter** module，has two variations
  - true: enable **counter** module
  - false：disable **counter** module

#### Please replace the secret with your own environment secret to enjoy the fun with feature flags