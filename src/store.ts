import { featureFlagEvaluatedTopic } from "./constants";
import { eventHub } from "./events";
import { logger } from "./logger";
import {
  FeatureFlagUpdateOperation,
  FeatureFlagValue,
  IDataStore,
  IFeatureFlag,
  IFeatureFlagChange,
  InsightType,
  StreamResponseEventType
} from "./types";
import localStorage from "./localStorage";
import {parseVariation} from "./utils";

const DataStoreStorageKey = 'ffcdatastore';

class Store {

  private _isDevMode: boolean = false;
  private _userId: string | null = null;

  private _store: IDataStore = {
    featureFlags: {} as { [key: string]: IFeatureFlag }
  }

  constructor() {
    eventHub.subscribe(`devmode_ff_${FeatureFlagUpdateOperation.update}`, (data) => {
      const updatedFfs = Object.keys(data).map(key => {
        const changes = data[key];
        const ff = this._store.featureFlags[key];
        const updatedFf = Object.assign({}, ff, { variation: changes['newValue'], timestamp: Date.now() });
        return updatedFf;
      }).reduce((res, curr) => {
        res.featureFlags[curr.id] = Object.assign({}, curr, { timestamp: Date.now() });
        return res;
      }, { featureFlags: {} });

      this.updateStorageBulk(updatedFfs, `${DataStoreStorageKey}_dev_${this._userId}`, false);
      this._loadFromStorage();
    });

    eventHub.subscribe(`devmode_ff_${FeatureFlagUpdateOperation.createDevData}`, () => {
      localStorage.removeItem(`${DataStoreStorageKey}_dev_${this._userId}`);
      this._loadFromStorage();
      eventHub.emit(`devmode_ff_${FeatureFlagUpdateOperation.devDataCreated}`, this._store.featureFlags);
    });
  }

  set userId(id: string) {
    this._userId = id;
    this._loadFromStorage();
  }

  set isDevMode(devMode: boolean) {
    this._isDevMode = devMode;
    this._loadFromStorage();
  }

  get isDevMode() {
    return this._isDevMode;
  }

  getFeatureFlag(key: string): IFeatureFlag {
    return this._store.featureFlags[key];
  }

  getVariation(key: string): FeatureFlagValue {
    const featureFlag = this._store.featureFlags[key];

    if (!featureFlag) {
      return undefined;
    }

    eventHub.emit(featureFlagEvaluatedTopic, {
      insightType: InsightType.featureFlagUsage,
      id: featureFlag.id,
      timestamp: Date.now(),
      sendToExperiment: featureFlag.sendToExperiment,
      variation: featureFlag.variationOptions.find(o => o.value === featureFlag.variation)
    });

    const { variationType, variation } = featureFlag;
    return parseVariation(variationType, variation);
  }

  setFullData(data: IDataStore) {
    if (!this._isDevMode) {
      this._store = {
        featureFlags: {} as { [key: string]: IFeatureFlag }
      };

      this._dumpToStorage(this._store);
    }
      
    this.updateBulkFromRemote(data);
  }

  getFeatureFlags(): { [key: string]: IFeatureFlag } {
    return this._store.featureFlags;
  }

  updateStorageBulk(data: IDataStore, storageKey: string, onlyInsertNewElement: boolean) {
    let dataStoreStr = localStorage.getItem(storageKey);
    let store: IDataStore | null = null;

    try {
      if (dataStoreStr && dataStoreStr.trim().length > 0) {
        store = JSON.parse(dataStoreStr);
      } else if (this.isDevMode || storageKey.indexOf('_dev_') === -1) {
        store = {
          featureFlags: {} as { [key: string]: IFeatureFlag }
        };
      }
    } catch (err) {
      logger.logDebug(`error while loading local data store: ${storageKey}` + err);
    }

    if (!!store) {
      const { featureFlags } = data;

      Object.keys(featureFlags).forEach(id => {
        const remoteFf = featureFlags[id];
        const localFf = store!.featureFlags[id];

        const predicate = !localFf || !onlyInsertNewElement;
        if (predicate) {
          store!.featureFlags[remoteFf.id] = Object.assign({}, remoteFf);
        }
      });

      this._dumpToStorage(store, storageKey);
    }
  }

  updateBulkFromRemote(data: IDataStore) {
    const storageKey = `${DataStoreStorageKey}_${this._userId}`;
    const devStorageKey = `${DataStoreStorageKey}_dev_${this._userId}`;

    this.updateStorageBulk(data, storageKey, false);
    this.updateStorageBulk(data, devStorageKey, true);

    this._loadFromStorage();
  }

  private _emitUpdateEvents(updatedFeatureFlags: any[]): void {
    if (updatedFeatureFlags.length > 0) {
      updatedFeatureFlags.forEach(({ id, operation, data }) => eventHub.emit(`ff_${operation}:${data.id}`, data));
      eventHub.emit(`ff_${FeatureFlagUpdateOperation.update}`, updatedFeatureFlags.map(item => item.data));
    }
  }

  private _dumpToStorage(store?: IDataStore, localStorageKey?: string): void {
    if (store) {
      const storageKey = localStorageKey || `${DataStoreStorageKey}_${this._userId}`;
      localStorage.setItem(storageKey, JSON.stringify(store));
      return;
    }
    const storageKey = this._isDevMode ? `${DataStoreStorageKey}_dev_${this._userId}` : `${DataStoreStorageKey}_${this._userId}`;
    localStorage.setItem(storageKey, JSON.stringify(this._store));
  }

  private _loadFromStorage(): void {
    try {
      const storageKey = this._isDevMode ? `${DataStoreStorageKey}_dev_${this._userId}` : `${DataStoreStorageKey}_${this._userId}`;
      let dataStoreStr = localStorage.getItem(storageKey);

      let shouldDumpToStorage = false;
      if (this._isDevMode) {
        try {
          const devData = JSON.parse(dataStoreStr!);

          if (devData === null || Object.keys(devData.featureFlags).length === 0) {
            shouldDumpToStorage = true;
            dataStoreStr = localStorage.getItem(`${DataStoreStorageKey}_${this._userId}`);
          }
        } catch (err) {
          shouldDumpToStorage = true;
          dataStoreStr = localStorage.getItem(`${DataStoreStorageKey}_${this._userId}`);
        }
      }

      if (dataStoreStr && dataStoreStr.trim().length > 0) {
        // compare _store and dataStoreStr data and send notification if different
        const storageData: IDataStore = JSON.parse(dataStoreStr);

        const updatedFeatureFlags = Object.keys(storageData.featureFlags).filter(key => {
          const storageFf = storageData.featureFlags[key];
          const ff = this._store.featureFlags[key];
          return !ff || storageFf.variation !== ff.variation || storageFf.variationType !== ff.variationType;
        }).map(key => {
          const storageFf = storageData.featureFlags[key];
          const ff = this._store.featureFlags[key];

          return {
            id: key,
            operation: FeatureFlagUpdateOperation.update,
            sendToExperiment: storageFf.sendToExperiment,
            data: {
              id: key,
              oldValue: ff? parseVariation(ff.variationType, ff.variation) : undefined,
              newValue: parseVariation(storageFf.variationType, storageFf.variation)
            } as IFeatureFlagChange
          }
        });

        this._store = storageData;
        this._emitUpdateEvents(updatedFeatureFlags);
      } else {
        this._store = {
          featureFlags: {} as { [key: string]: IFeatureFlag }
        };
      }

      if (shouldDumpToStorage) {
        this._dumpToStorage();
      }

    } catch (err) {
      logger.logDebug('error while loading local data store: ' + err);
    }
  }
}

export default new Store();