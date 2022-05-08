import { IExptMetricSetting, IStreamResponse, IUser, IZeroCode } from "./types";
declare class NetworkService {
    private user;
    private api;
    private secret;
    private appType;
    private retryCounter;
    constructor();
    init(api: string, secret: string, appType: string): void;
    identify(user: IUser): void;
    private socket;
    createConnection(timestamp: number, onMessage: (response: IStreamResponse) => any): void;
    private __getUserInfo;
    private formatSendDataForSocket;
    sendInsights: any;
    getActiveExperimentMetricSettings(): Promise<IExptMetricSetting[] | []>;
    getZeroCodeSettings(): Promise<IZeroCode[] | []>;
}
export declare const networkService: NetworkService;
export declare function post(url?: string, data?: any, headers?: {
    [key: string]: string;
}): Promise<unknown>;
export declare function get(url?: string, headers?: {
    [key: string]: string;
}): Promise<unknown>;
export {};
