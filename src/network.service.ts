import { websocketReconnectTopic, WebSocket } from "./constants";
import { eventHub } from "./events";
import { logger } from "./logger";
import { IExptMetricSetting, IInsight, InsightType, IStreamResponse, IUser, IZeroCode } from "./types";
import { generateConnectionToken } from "./utils";
import throttleUtil from "./throttleutil";

const socketConnectionIntervals = [250, 500, 1000, 2000, 4000, 8000];

class NetworkService {
  private user: IUser | undefined;
  private api: string | undefined;
  private secret: string | undefined;
  private appType: string | undefined;

  private retryCounter = 0;

  constructor(){}

  init(api: string, secret: string, appType: string) {
    this.api = api;
    this.secret = secret;
    this.appType = appType;
  }

  identify(user: IUser) {
    if (this.user?.id !== user.id) {
      this.user = { ...user };
      throttleUtil.setKey(this.user?.id);

      if (this.socket) {
        this.sendUserIdentifyMessage(0);
      }
    }
  }

  private socket: any;

  private reconnect() {
    this.socket = null;
    const waitTime = socketConnectionIntervals[Math.min(this.retryCounter++, socketConnectionIntervals.length - 1)];
    setTimeout(() => {
      logger.logDebug('emit reconnect event');
      eventHub.emit(websocketReconnectTopic, {});
    }, waitTime);
    logger.logDebug(waitTime);
  }

  private sendPingMessage() {
    const payload = {
      messageType: 'ping',
      data: null
    };

    setTimeout(() => {
      try {
        if (this.socket?.readyState === WebSocket.OPEN) {
          logger.logDebug('sending ping')
          this.socket.send(this.formatSendDataForSocket(payload));
          this.sendPingMessage();
        } else {
          logger.logDebug(`socket closed at ${new Date()}`);
          this.reconnect();
        }
      } catch (err) {
        logger.logDebug(err);
      }
    }, 18000);
  }

  private sendUserIdentifyMessage(timestamp: number) {
    const { userName, email, country, id, customizedProperties } = this.user!;
    const payload = {
      messageType: 'data-sync',
      data: {
        user: {
          userName,
          email,
          country,
          userKeyId: id,
          customizedProperties,
        },
        timestamp
      }
    };
    this.socket?.send(this.formatSendDataForSocket(payload));
  }

  createConnection(timestamp: number, onMessage: (response: IStreamResponse) => any) {
    const that = this;
    if (that.socket) {
      onMessage({} as IStreamResponse);
      return;
    }

    const startTime = Date.now();
    // Create WebSocket connection.
    const url = this.api?.replace(/^http/, 'ws') + `/streaming?type=client&token=${generateConnectionToken(this.secret!)}`;
    that.socket = wx.connectSocket({ url });
  
    // Connection opened
    that.socket.onOpen(function (this: WebSocket, header, profile) {
      logger.logDebug(`Connection time: ${Date.now() - startTime} ms`);
      that.sendUserIdentifyMessage(timestamp);
      that.sendPingMessage();
    });
  
    // Connection closed
    that.socket.onClose(({code, reason}) => {
      logger.logDebug('close');
      if (code === 4003) { // do not reconnect when 4003
        return;
      }

      that.reconnect();
    });
  
    // Connection error
    that.socket.onError(function (errMsg) {
      logger.logDebug(errMsg);
    });
  
    // Listen for messages
    that.socket.onMessage(function (event) {
      const message = JSON.parse(event.data);
      if (message.messageType === 'data-sync') {
        onMessage(message.data);
        if (message.data.featureFlags.length > 0) {
          logger.logDebug('socket push update time(ms): ', Date.now() - message.data.featureFlags[0].timestamp);
        }
      }
    });
  }

  private __getUserInfo(): any {
    const { userName, email, country, id, customizedProperties } = this.user!;
    return {
      userName,
      email,
      country,
      keyId: id,
      customizedProperties: customizedProperties,
    }
  }

  private formatSendDataForSocket(message: any): any {
    return {
        data: JSON.stringify(message),
        success: () => logger.logDebug(`websocket send success`),
        fail: (event) => logger.log(`websocket error when sending message: ${JSON.stringify(event)}`)
    };
  }

  sendInsights = throttleUtil.throttleAsync(async (data: IInsight[]): Promise<void> => {
    if (!this.secret || !this.user || !data || data.length === 0) {
      return;
    }
  
    try {
      const payload = [{
        user: this.__getUserInfo(),
        userVariations: data.filter(d => d.insightType === InsightType.featureFlagUsage).map(v => ({
          featureFlagKeyName: v.id,
          sendToExperiment: v.sendToExperiment,
          timestamp: v.timestamp,
          variation: {
            localId: v.variation!.id,
            variationValue: v.variation!.value
          }
        })),
        metrics: data.filter(d => d.insightType !== InsightType.featureFlagUsage).map(d => ({
          route: location.pathname,
          numericValue: d.numericValue === null || d.numericValue === undefined? 1 : d.numericValue,
          appType: this.appType,
          eventName: d.eventName,
          type: d.type
        }))
      }];
  
      await post(`${this.api}/api/public/track`, payload, { envSecret: this.secret });
    } catch (err) {
      logger.logDebug(err);
    }
  })

  async getActiveExperimentMetricSettings(): Promise<IExptMetricSetting[] | []> {
    // TODO
    return [];
  }

  async getZeroCodeSettings(): Promise<IZeroCode[] | []> {
    // TODO
    return [];
  }
}

export const networkService = new NetworkService();

export async function post(url: string = '', data: any = {}, headers: { [key: string]: string } = {}) {
  return await new Promise(resolve => {
    wx.request({
        url,
        method: 'POST',
        data: data,
        header: Object.assign({
            'Content-Type': 'application/json'
        }, headers),

        fail: function (res) {
            resolve({});
            logger.logDebug(res);
        },
        success: function (res) {
            resolve(res.status === 200 ? res : {});
        }
    });
  });
}

export async function get(url: string = '', headers: { [key: string]: string } = {}) {
  return await new Promise(resolve => {
    wx.request({
        url,
        method: 'GET',
        header: Object.assign({
            'Content-Type': 'application/json'
        }, headers),

        fail: function (res) {
            resolve({});
            logger.logDebug(res);
        },
        success: function (res) {
            resolve(res.status === 200 ? res : {});
        }
    });
  });
}
