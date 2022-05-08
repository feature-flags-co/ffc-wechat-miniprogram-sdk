declare class ThrottleUtil {
    private _key;
    constructor();
    setKey(key: string): void;
    throttle(fn: Function, ms: number): (...args: any[]) => void;
    throttleAsync(callback: any): any;
}
declare const _default: ThrottleUtil;
export default _default;
