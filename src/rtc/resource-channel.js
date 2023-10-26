import MultiRTCPeerConnection from './multi-rtc-peer-connection';
import Signaling from './signaling';
import Logger from '../utils/logger';
import { generateID, wrap, unwrap } from '../utils/transfer';

const logger = new Logger('【fetchRTC】');
const commandMap = {
  fetch: 'fetch',
  peers: 'peers',
};

class RTCResourceChannel {
  static defaultOptions = {
    channelMaxRetries: 3,
    socketBaseURL: 'wss://service-h4z7zdeo-1258344701.gz.apigw.tencentcs.com',
  };

  constructor(peer, room, options = {}) {
    this.options = { ...RTCResourceChannel.defaultOptions, ...options };
    this.retryAttempts = 0;
    this.promiseResolves = {};

    const { socketBaseURL } = this.options;
    const socket = new WebSocket(`${socketBaseURL}?room=${room}&peer=${peer}`);
    this.signaling = new Signaling(socket);

    socket.addEventListener('open', () => {
      socket.addEventListener('message', ({ data: message }) => {
        const { data, cmd } = JSON.parse(message);

        if (cmd === commandMap.peers) {
          const peers = data.filter((currentPeer) => currentPeer !== peer);
          this.multiRTCPeerConnection = new MultiRTCPeerConnection(
            peers,
            this.signaling
          );
          window.$multiRTCPeerConnection = this.multiRTCPeerConnection;

          this.multiRTCPeerConnection.addEventListener(
            'new',
            ({ detail: connection }) => {
              this.listenChannel(connection);
            }
          );
          this.multiRTCPeerConnection.connections.forEach((connection) => {
            this.listenChannel(connection);
            this.mountChannel(connection);
          });
        }
      });
      socket.send('{"cmd":"peers"}');
    });
  }

  broadcast(cmd, data) {
    this.multiRTCPeerConnection?.connections.forEach((connection) => {
      const sendFetchEvent = () => {
        let channelMessage;
        try {
          channelMessage = JSON.stringify({ cmd, data });
        } catch {
          logger.error('message 转换异常', cmd, data);
        }
        connection.channel?.send(channelMessage);
      };

      if (connection.channel?.readyState === 'open') {
        sendFetchEvent();
      } else {
        connection.channel.onopen = () => {
          sendFetchEvent();
        };
      }
    });
  }

  mountChannel(connection, channel) {
    if (!channel) {
      connection.channel = connection.createDataChannel('');
    } else {
      connection.channel = channel;
    }

    connection.channel.addEventListener('error', ({ error }) => {
      const { channelMaxRetries } = this.options;
      if (error.errorDetail || this.retryAttempts > channelMaxRetries) {
        return;
      }
      this.retryAttempts++;
      this.mountChannel(connection);
    });

    connection.channel.addEventListener(
      'message',
      async ({ data: message }) => {
        this.retryAttempts = 0;

        if (typeof message === 'string') {
          let cmd;
          let data;
          try {
            let parsedMessage = JSON.parse(message);
            cmd = parsedMessage.cmd;
            data = parsedMessage.data;
          } catch {
            logger.error('message 解析异常', message);
          }

          if (cmd === commandMap.fetch) {
            const { url, id } = data;
            let response = await caches.match(url, { ignoreSearch: true });
            if (!response) {
              return;
            }
            const message = await wrap(response, id);
            connection.channel?.send(message);
          }
        }

        if (message instanceof ArrayBuffer) {
          const { id, headers, body } = await unwrap(message);
          this.promiseResolves[id]?.call(this, {
            headers,
            body,
          });
        }
      }
    );

    return connection.channel;
  }

  listenChannel(connection) {
    connection.addEventListener('datachannel', ({ channel }) => {
      this.mountChannel(connection, channel);
    });
  }

  listen(serviceWorker) {
    serviceWorker.addEventListener('message', ({ data }) => {
      const { url, id } = data;
      logger.info('发起', data);
      this.fetch(url).then(({ headers, body }) => {
        logger.info('响应', { headers, body });
        navigator.serviceWorker.controller.postMessage({
          id,
          headers,
          body,
        });
      });
    });
  }

  fetch(url) {
    return new Promise((resolve) => {
      const id = generateID();
      this.broadcast(commandMap.fetch, { url, id });

      this.promiseResolves[id] = resolve;
    });
  }
}

export default RTCResourceChannel;
