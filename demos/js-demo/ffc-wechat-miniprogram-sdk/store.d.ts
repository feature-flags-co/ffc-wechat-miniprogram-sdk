import { IDataStore, IFeatureFlag } from "./types";
declare class Store {
    private _isDevMode;
    private _userId;
    private _store;
    constructor();
    set userId(id: string);
    set isDevMode(devMode: boolean);
    get isDevMode(): boolean;
    getFeatureFlag(key: string): IFeatureFlag;
    getVariation(key: string): string;
    setFullData(data: IDataStore): void;
    getFeatureFlags(): {
        [key: string]: IFeatureFlag;
    };
    updateStorageBulk(data: IDataStore, storageKey: string, onlyInsertNewElement: boolean): void;
    updateBulkFromRemote(data: IDataStore): void;
    private _emitUpdateEvents;
    private _dumpToStorage;
    private _loadFromStorage;
}
declare const _default: Store;
export default _default;
