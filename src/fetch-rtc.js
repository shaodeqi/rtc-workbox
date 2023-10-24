import { MultiRTCPeerConnection } from './rtc/multi-rtc-peer-connection';
import { Signaling } from './rtc/signaling';
import { wrap, unwrap, idBytes } from './utils';

const generateID = (len = 16) =>
  Array.from(new Array(len), () => Math.floor(Math.random() * 256)).join();

const peer = new URLSearchParams(location.search).get('peer');
const socketURL = `wss://service-h4z7zdeo-1258344701.gz.apigw.tencentcs.com?room=ola&peer=${peer}`;

const socket = new WebSocket(socketURL);
const signaling = new Signaling(socket);
const promiseResolves = {};

const CoolDownTime = 10000;

let retryCount = 3;
let connections;

// channel 发送消息
const sendMessage = (connection, data) => {
  connection.channel?.send(data);
};

// 挂载 channel 到 connection
const mountChannelToConnection = (connection, channel) => {
  if (!channel) {
    connection.channel = connection.createDataChannel('resource');
  } else {
    connection.channel = channel;
  }

  connection.channel.addEventListener('error', ({ error }) => {
    console.log('【channel】datachannel异常', error);
    if (!error.errorDetail && retryCount-- > 0) {
      mountChannelToConnection(connection);
      setTimeout(() => {
        retryCount = 3;
      }, CoolDownTime);
    }
  });
  connection.channel.addEventListener('message', async ({ data: message }) => {
    // 拉取
    if (typeof message === 'string') {
      const { cmd, data } = JSON.parse(message);
      console.log('【channel】', cmd, data);

      if (cmd === 'fetch') {
        const { url, id } = data;
        let response = await caches.match(url, { ignoreSearch: true });
        console.log('【channel】response', response);
        if (response) {
          const message = await wrap(response, id);
          sendMessage(connection, message);
        }
      }
    }

    // 响应
    if (message instanceof ArrayBuffer) {
      const { id, headers, response } = await unwrap(message);
      console.log(id, headers, response);
      promiseResolves[id]?.call(this, { headers, response });
    }
  });

  return connection.channel;
};

// 监听 connection datachannel 事件
const listenChannelCreate = (connection) => {
  connection.addEventListener('datachannel', ({ channel }) => {
    console.log('【channel】对方建立channel');
    mountChannelToConnection(connection, channel);
  });
};

socket.addEventListener('open', () => {
  socket.addEventListener('message', ({ data }) => {
    const { data: onlinePeers, cmd } = JSON.parse(data);
    if (cmd === 'peers') {
      const peers = onlinePeers.filter((currentPeer) => currentPeer !== peer);

      const multiRTCPeerConnection = new MultiRTCPeerConnection(
        peers,
        signaling
      );
      window.$multiRTCPeerConnection = multiRTCPeerConnection;
      connections = multiRTCPeerConnection.connections;

      connections.forEach((connection) => {
        listenChannelCreate(connection);

        mountChannelToConnection(connection);
      });

      multiRTCPeerConnection.addEventListener(
        'new',
        ({ detail: connection }) => {
          listenChannelCreate(connection);
        }
      );
    }
  });
  socket.send(
    JSON.stringify({
      cmd: 'peers',
    })
  );
});

const fetchRTC = (url, id = generateID(idBytes)) => {
  return new Promise((resolve) => {
    connections?.forEach((connection) => {
      if (!connection.channel) {
        console.warn('【fetchRTC】没有 channel');
        return;
      }

      const sendToPeers = () => {
        sendMessage(
          connection,
          JSON.stringify({ data: { url, id }, cmd: 'fetch' })
        );
      };

      if (connection.channel.readyState === 'open') {
        sendToPeers();
      } else {
        connection.channel.onopen = () => {
          sendToPeers();
        };
      }

      promiseResolves[id] = resolve;
    });
  });
};
export default fetchRTC;
