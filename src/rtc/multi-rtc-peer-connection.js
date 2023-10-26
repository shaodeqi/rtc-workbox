import Logger from '../utils/logger';
const logger = new Logger('【MRPC】');

export default class MultiRTCPeerConnection extends EventTarget {
  constructor(peers, signaling) {
    super();
    this.peers = peers;
    this.connections = [];
    this.signaling = signaling;

    this.listenSignaling();

    peers.forEach(async (peer) => {
      await this.join(peer);
    });
  }

  async sendOffer(connection) {
    const { signaling } = this;

    const offer = await connection.createOffer();
    try {
      connection.setLocalDescription(offer);
      signaling.send(
        {
          type: 'offer',
          data: offer,
        },
        connection.peer
      );
      logger.info('发送offer', offer);
    } catch (error) {
      logger.info('发送offer失败', error);
    }
  }

  listenSignaling() {
    const { signaling, connections, join } = this;

    signaling.addEventListener(
      'message',
      async ({
        detail: {
          from,
          content: { type, data },
        },
      }) => {
        let connection = connections.find((connection) => {
          return connection.peer === from;
        });

        if (!connection) {
          logger.info('未找到匹配的 connection, 重新创建');
          connection = await join.call(this, from);

          this.dispatchEvent(
            new CustomEvent('new', {
              detail: connection,
            })
          );
        }

        switch (type) {
          case 'offer':
            logger.info('收到offer', data);
            try {
              await connection.setRemoteDescription(data);

              const answer = await connection.createAnswer();
              signaling.send({ type: 'answer', data: answer }, from);
              logger.info('发送answer', answer);
              connection.setLocalDescription(answer);
            } catch (e) {
              logger.info('收到 offer 后执行异常', e);
            }
            break;

          case 'answer':
            logger.info('收到 answer', data);
            try {
              connection.setRemoteDescription(data);
            } catch (error) {
              logger.info('setRemoteDescription 失败', error);
            }
            break;

          case 'candidate':
            logger.info('收到 candidate', data);
            connection.addIceCandidate(data);
            break;
        }
      }
    );
  }

  listenConnection(connection) {
    const { signaling } = this;

    connection.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate === null) {
        return;
      }

      signaling.send({ type: 'candidate', data: candidate }, connection.peer);
      logger.info('发送 candidate', candidate);
    });

    connection.addEventListener('negotiationneeded', async () => {
      logger.info('negotiationneeded');
      this.sendOffer(connection);
    });

    connection.addEventListener('connectionstatechange', async () => {
      logger.info(
        `与用户${connection.peer}连接状态：${connection.connectionState}`
      );
    });
  }

  async join(peer) {
    const { connections } = this;
    const connection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
    });
    logger.info('创建 RTCPeerConnection', peer);
    this.listenConnection(connection);

    connection.peer = peer;

    connections.push(connection);
    return connection;
  }
}
