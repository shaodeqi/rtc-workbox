import { MultiRTCPeerConnection } from "./rtc/multi-rtc-peer-connection";
import { Signaling } from "./rtc/signaling";

const peer = new URLSearchParams(location.search).get('peer');
const socketURL = `ws://127.0.0.1:9000?room=ola&peer=${peer}`

const socket = new WebSocket(socketURL);
const signaling = new Signaling(socket);
let connections;

socket.addEventListener('open', () => {
    socket.addEventListener('message', ({ data }) => {
        const {data: onlinePeers, cmd} = JSON.parse(data);
        if (cmd === 'peers') {
            const peers = onlinePeers.filter((currentPeer) => currentPeer !== peer);

            const multiRTCPeerConnection = new MultiRTCPeerConnection(peers, signaling);
            connections = multiRTCPeerConnection.connections;

            const createChannel = (connection, channel) => {
                if (!channel) {
                    connection.channel = connection.createDataChannel('resource');
                } else {
                    connection.channel = channel;
                }
                connection.channel.addEventListener('message', (e) => {
                    console.log('!passion', e);
                })
            }

            connections.forEach((connection) => {
                createChannel(connection)
            })

            multiRTCPeerConnection.addEventListener('new', ({detail: connection}) => {
                connection.addEventListener('datachannel', ({ channel }) => {
                    createChannel(connection, channel);
                  })
            })
            
        }
    })
    socket.send(JSON.stringify({
        cmd: 'peers',
    }));

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
            console.log(connection.channel);

            if (connection.channel.readyState === 'open') {
                connection.channel.send(url)
            } else {
                connection.channel.onopen = () => {
                    connection.channel.send(url)
                }
            }
            // connection.channel.addEventListener('message', (event) => {
            //     console.log(event.data);
            //     resolve(event.data);
            // })
            // connection.channel.onmessage = (event) => {
            //     console.log('channel message', event);
            // }
            // console.log('channel1', connection.channel);
            // connection.channel.send(url);
        })
    
    });
}
export default fetchRTC;