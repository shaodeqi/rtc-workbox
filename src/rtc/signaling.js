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
const prefix = 'signaling';

const tranfer = async (message) => {
  const { data: originData } = message;
  const payload = await handleMessageData(originData);
  const { cmd, data = {}, user } = payload;
  const { type, content } = data;

  if (cmd !== 'send' || type !== prefix) {
    return;
  }

  return { content, from: user };
};

export class Signaling extends EventTarget {
  constructor(socket) {
    super();
    this.socket = socket;

    this.socket.addEventListener('message', async (message) => {
      const detail = await tranfer(message);
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
          type: prefix,
          content,
        },
        users: peer ? [peer] : [],
      }),
    );
  }
}
