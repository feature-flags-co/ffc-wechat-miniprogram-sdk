import ffcClient, { Ffc } from './ffc';
export * from './types';
export { Ffc };
export default ffcClient;
function fetchFlags(component) {
    var configs = component.data.flagConfigs || [];
    var flags = configs.map(function (_a) {
        var key = _a.key, defaultValue = _a.defaultValue;
        ffcClient.on("ff_update:".concat(key), function () {
            var _a;
            var variation = ffcClient.variation(key, defaultValue);
            component.setData({ flags: Object.assign({}, component.data.flags, (_a = {}, _a[key] = variation, _a)) });
        });
        return { key: key, variation: ffcClient.variation(key, defaultValue) };
    })
        .reduce(function (acc, cur) {
        acc[cur.key] = cur.variation;
        return acc;
    }, {});
    component.setData({ flags: flags });
}
var oldPage = Page;
Page = function (options) {
    var oldOnLoad = options.onLoad;
    options.onLoad = function () {
        fetchFlags(this);
        oldOnLoad && oldOnLoad.call(this);
    };
    return oldPage(options);
};
var oldComponent = Component;
Component = function (options) {
    var oldAttached = options.attached;
    options.attached = function () {
        fetchFlags(this);
        oldAttached && oldAttached.call(this);
    };
    if (options.lifetimes && options.lifetimes.attached) {
        options.lifetimes.attached = function () {
            fetchFlags(this);
            oldAttached && oldAttached.call(this);
        };
    }
    return oldComponent(options);
};
//# sourceMappingURL=index.js.map