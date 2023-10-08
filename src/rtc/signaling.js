const type = (content) =>
  Object.prototype.toString.call(content).slice(8, -1);

const handleMessageData = async (data) => {
  let payloadStr = data;
  if (type(data) === 'Blob') {
    payloadStr = await data.text();
  }
  let payload = {};
  try {
    payload = JSON.parse(payloadStr);
  } catch (e) {
    console.error(e);
  }
  return payload;
};
const dataType = 'signaling';

const messageTranfer = async (message) => {
  const { data: originData } = message;
  const payload = await handleMessageData(originData);
  const { cmd, from, data = {} } = payload;
  const { type, content } = data;

  if (cmd !== 'send' || type !== dataType) {
    return;
  }

  return { content, from };
};

export class Signaling extends EventTarget {
  constructor(socket) {
    super();
    this.socket = socket;
    const OPEN = 1;
    const CLOSED = 3;

    if (socket.readyState === OPEN) {
      const event = new CustomEvent('open');
      this.dispatchEvent(event);
    }

    if (socket.readyState === CLOSED) {
      const event = new CustomEvent('close');
      this.dispatchEvent(event);
    }

    this.socket.addEventListener('open', (detail) => {
      const event = new CustomEvent('open', detail);
      this.dispatchEvent(event);
    })
    this.socket.addEventListener('close', (detail) => {
      const event = new CustomEvent('close', detail);
      this.dispatchEvent(event);
    })
    this.socket.addEventListener('message', async (message) => {
      const detail = await messageTranfer(message);
      if (!detail) {
        return;
      }

      const event = new CustomEvent('message', {
        detail,
      });
      this.dispatchEvent(event);
    });
  }
  send(content, peer) {
    this.socket.send(
      JSON.stringify({
        cmd: 'send',
        data: {
          type: dataType,
          content,
        },
        to: peer ? [peer] : [],
      }),
    );
  }
}
