import ffcClient, { Ffc } from './ffc';
import { IFlagConfig } from './types';

export * from './types';

export { Ffc }
export default ffcClient;

// rewrite wx funcs
declare global {
    var Page;
    var Component;
}

function fetchFlags(component: any): any {
    const configs: IFlagConfig[] = component.data.flagConfigs || [];

    const flags = configs.map(({ key, defaultValue }) => {
        ffcClient.on(`ff_update:${key}`, () => {
            const variation = ffcClient.variation(key, defaultValue);
            component.setData({ flags: Object.assign({}, component.data.flags, { [key]: variation }) });
        });

        return { key: key, variation: ffcClient.variation(key, defaultValue) }
    })
        .reduce((acc: any, cur: any) => {
            acc[cur.key] = cur.variation;
            return acc;
        }, {});

    component.setData({ flags: flags });
}

let oldPage = Page;

Page = (options: any) => {
    let oldOnLoad = options.onLoad;

    options.onLoad = function () {
        fetchFlags(this);
        oldOnLoad && oldOnLoad.call(this);
    }

    return oldPage(options);
}

let oldComponent = Component;

Component = (options: any) => {
    let oldAttached = options.attached;

    options.attached = function () {
        fetchFlags(this);
        oldAttached && oldAttached.call(this);
    }

    if (options.lifetimes && options.lifetimes.attached) {
        options.lifetimes.attached = function () {
            fetchFlags(this);
            oldAttached && oldAttached.call(this);
        }
    }
    
    return oldComponent(options);
}

