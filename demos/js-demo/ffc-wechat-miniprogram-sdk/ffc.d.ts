import { IFeatureFlagSet, ICustomEvent, IFeatureFlag, IFeatureFlagBase, IOption, IUser, IFeatureFlagChange } from "./types";
export declare class Ffc {
    private _readyEventEmitted;
    private _readyPromise;
    private _insightsQueue;
    private _featureFlagEvaluationBuffer;
    private _option;
    constructor();
    on(name: string, cb: (change: IFeatureFlagChange) => void): void;
    waitUntilReady(): Promise<IFeatureFlagBase[]>;
    init(option: IOption): Promise<void>;
    identify(user: IUser): Promise<void>;
    logout(): Promise<IUser>;
    bootstrap(featureFlags?: IFeatureFlag[]): Promise<void>;
    private dataSync;
    variation(key: string, defaultResult: string): string;
    boolVariation(key: string, defaultResult: boolean): boolean;
    getUser(): IUser;
    sendCustomEvent(data: ICustomEvent[]): void;
    sendFeatureFlagInsight(key: string, variation: string): void;
    getAllFeatureFlags(): IFeatureFlagSet;
}
declare const ffcClient: Ffc;
export default ffcClient;
