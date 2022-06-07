import ffcClient, {Ffc} from './ffc';
import {IFlagConfig} from './types';
import {eventHub} from "./events";
import {websocketReconnectTopic} from "./constants";

export * from './types';

export {Ffc}
export default ffcClient;

// rewrite wx funcs
declare global {
    var App;
    var Page;
    var Component;
}

function fetchFlags(component: any): any {
    const configs: IFlagConfig[] = component.data.flagConfigs || [];

    const flags = configs.map(({key, defaultValue}) => {
        ffcClient.on(`ff_update:${key}`, () => {
            const variation = ffcClient.variation(key, defaultValue);
            component.setData({flags: Object.assign({}, component.data.flags, {[key]: variation})});
        });

        return {key: key, variation: ffcClient.variation(key, defaultValue)}
    })
        .reduce((acc: any, cur: any) => {
            acc[cur.key] = cur.variation;
            return acc;
        }, {});

    component.setData({flags: flags});
}

// defined this interface to avoid typescript error
interface IQuery {
    params?: any;
}

// 还原上个页面的参数到 options, 并删除 options.params
const extractParams = function (query: IQuery = {}) {
    const {params} = query
    let options = {...query}
    if (params !== undefined) {
        options = {
            ...options,
            ...JSON.parse(decodeURIComponent(params)),
        }
        delete options.params
    }
    return options
}

let originalApp = App;

App = function(config: any = {}) {
    let {onShow} = config;
    let counter = 1;

    config.onShow = function() {
        if (counter > 1) {
            eventHub.emit(websocketReconnectTopic, {});
        }

        counter++;

        onShow && onShow.call(this);
    }

    return originalApp(config);
}

let originPage = Page;

Page = function (config: any = {}) {
    let {onLoad} = config;

    config.onLoad = function (options: any = {}) {
        fetchFlags(this);
        onLoad && onLoad.call(this, extractParams(options));
    }

    return originPage(config);
}

let originalComponent = Component;

Component = function (config: any = {}) {
    const {attached} = config;

    config.attached = function (options: any = {}) {
        fetchFlags(this);
        attached && attached.call(this, extractParams(options));
    }

    if (config.lifetimes && config.lifetimes.attached) {
        const lifetimeAttached = config.lifetimes.attached;

        config.lifetimes.attached = function () {
            fetchFlags(this);
            lifetimeAttached && lifetimeAttached.call(this);
        }
    }

    return originalComponent(config);
}

