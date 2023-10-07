export class MultiRTCPeerConnection extends EventTarget {
  constructor(peers, signaling) {
    super();
    this.peers = peers;
    this.connections = [];
    this.signaling = signaling;
    this.$connections = this.connections;

    this.listenSignaling();

    peers.forEach(async (peer) => {
      console.log(`准备与${peer}建立连接`);
      await this.join(peer);
    });
  }

  async sendOffer(connection) {
    const { signaling } = this;

    const offer = await connection.createOffer();
    connection.setLocalDescription(offer);
    signaling.send(
      {
        type: 'offer',
        data: offer,
      },
      connection.peer,
    );
    console.log('发送offer', offer);
  }

  listenSignaling() {
    const { signaling, connections, join } = this;
    let trackEvent;

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
          console.log('未找到匹配的 connection, 重新创建');
          connection = await join.call(this, from, true);
        }

        switch (type) {
          case 'offer':
            console.log('收到offer', data);
            try {
              connection.setRemoteDescription(data);
              const answer = await connection.createAnswer();
              signaling.send({ type: 'answer', data: answer }, from);
              console.log('发送answer', answer);
              connection.setLocalDescription(answer);
            } catch (e) {
              console.log('收到 offer 后执行异常', e);
            }
            trackEvent = new CustomEvent('offer', {
              detail: connection,
            });
            this.dispatchEvent(trackEvent);
            break;

          case 'answer':
            console.log('收到 answer', data);
            connection.setRemoteDescription(data);
            break;

          case 'candidate':
            console.log('收到 candidate', data);
            connection.addIceCandidate(data);
            break;
        }
      },
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
      console.log('negotiationneeded');
      this.sendOffer(connection);
    });
    connection.addEventListener('connectionstatechange', async () => {
      if (connection.connectionState === 'connected') {
        console.log(`与${connection.peer}对等连接成功！`);
      }
      if (connection.connectionState === 'disconnected') {
        console.log(`与${connection.peer}对等连接断开！`);
      }
    });
    connection.ondatachannel = (event) => {
      console.log('ondatachannel', event);
    }
    connection.addEventListener('datachannel', ({ channel }) => {
      console.log('datachannel', channel)
      connection.channel = channel;
    })
  }

  async join(peer, passive = false) {
    const {connections } = this;
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
    this.listenConnection(connection);

    console.log('创建 RTCPeerConnection', peer);

    connection.peer = peer;

    if (!passive) {
      this.sendOffer(connection);
    }

    connections.push(connection);
    return connection;
  }
}
  