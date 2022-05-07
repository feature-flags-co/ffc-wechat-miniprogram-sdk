declare class wx {
    static connectSocket(option: any):any;
    static request(option: any): any;
    static getStorageSync(key: string): any;
    static setStorageSync(key: string, data: any): void;
    static removeStorageSync(key: string): void;
}