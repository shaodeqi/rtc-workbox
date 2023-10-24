export class MultiRTCPeerConnection extends EventTarget {
  constructor(peers, signaling) {
    super();
    this.peers = peers;
    this.connections = [];
    this.signaling = signaling;
    this.$connections = this.connections;

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
      console.log('【MultiRPC】发送offer', offer);
    } catch (error) {
      console.log('【MultiRPC】发送offer失败', error);
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
          console.log('【MultiRPC】未找到匹配的 connection, 重新创建');
          connection = await join.call(this, from, true);

          this.dispatchEvent(
            new CustomEvent('new', {
              detail: connection,
            })
          );
        }

        switch (type) {
          case 'offer':
            console.log('【MultiRPC】收到offer', data);
            try {
              await connection.setRemoteDescription(data);

              const answer = await connection.createAnswer();
              signaling.send({ type: 'answer', data: answer }, from);
              console.log('【MultiRPC】发送answer', answer);
              connection.setLocalDescription(answer);
            } catch (e) {
              console.log('【MultiRPC】收到 offer 后执行异常', e);
            }
            break;

          case 'answer':
            console.log('【MultiRPC】收到 answer', data);
            try {
              connection.setRemoteDescription(data);
              connection.addEventListener('datachannel', () => {
                console.warn('对方建立datachannel', connection);
              });
            } catch (error) {
              console.log('【MultiRPC】setRemoteDescription 失败', error);
            }
            break;

          case 'candidate':
            console.log('【MultiRPC】收到 candidate', data);
            connection.addIceCandidate(data);
            break;
        }
      }
    );
  }

  listenConnection(connection) {
    const { signaling } = this;

    connection.addEventListener('icecandidate', ({ candidate }) => {
      if (!candidate) {
        return;
      }
      signaling.send({ type: 'candidate', data: candidate }, connection.peer);
    });
    connection.addEventListener('negotiationneeded', async () => {
      console.log('【MultiRPC】negotiationneeded');
      this.sendOffer(connection);
    });
    connection.addEventListener('connectionstatechange', async () => {
      const stateMap = {
        connected: '建立',
        disconnected: '断开',
        connecting: '中',
      };
      console.log(
        `【MultiRPC】与用户${connection.peer}对等连接${
          stateMap[connection.connectionState] || connection.connectionState
        }！`
      );
    });
  }

  async join(peer, passive) {
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
    console.log('【MultiRPC】创建 RTCPeerConnection', peer);
    this.listenConnection(connection);

    connection.peer = peer;
    if (!passive) {
      this.sendOffer(connection);
    }

    connections.push(connection);
    return connection;
  }
}
