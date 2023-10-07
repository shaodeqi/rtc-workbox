import { MultiRTCPeerConnection } from "./rtc/multi-rtc-peer-connection";
import { Signaling } from "./rtc/signaling";

const peer = new URLSearchParams(location.search).get('peer');
const socketURL = `ws://127.0.0.1:9000?room=ola&user=${peer}`

const socket = new WebSocket(socketURL);
const signaling = new Signaling(socket);
let connections;
socket.addEventListener('open', () => {
    connections = new MultiRTCPeerConnection([String(+!+peer)], signaling).connections;
    connections.forEach((connection) => {
        if (!connection.channel) {
            connection.channel = connection.createDataChannel('resource');
            connection.channel.onopen = (event) => {
                console.log('channel open', event);
                connection.channel.send('123')
            }
            console.log('没有channel, 主动创建')
        }
    })
})


export const randomString = (min = 43, max = min) => {
    const chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charsLength = chars.length;
    let randomCharsLength = Math.floor(
      min + Math.random() * (Math.abs(max - min) + 1)
    );
  
    let result = '';
    while (randomCharsLength--) {
      const randomCharIndex = Math.floor(Math.random() * charsLength);
      result += chars[randomCharIndex];
    }
    return result;
  };

const fetchRTC = (url) => {

    return new Promise(() => {
        connections.forEach((connection) => {
            // connection.channel.addEventListener('message', (event) => {
            //     console.log(event.data);
            //     resolve(event.data);
            // })
            connection.channel.onmessage = (event) => {
                console.log('channel message', event);
            }
            console.log('channel1', connection.channel);
            connection.channel.send(url);
        })
    
    });
}
export default fetchRTC;