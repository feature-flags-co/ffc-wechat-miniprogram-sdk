interface Events {
    [key: string]: Function[];
}
declare class EventEmitter {
    events: Events;
    constructor(events?: Events);
    subscribe(name: string, cb: Function): {
        unsubscribe: () => Function[];
    };
    emit(name: string, ...args: any[]): void;
}
export declare const eventHub: EventEmitter;
export {};
