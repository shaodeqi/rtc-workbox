import RTCResourceChannel from './rtc/resource-channel';

const peer = new URLSearchParams(location.search).get('peer');

export const register = () => {
  if ('serviceWorker' in navigator) {
    // serviceWorker 注册
    window.addEventListener('load', () => {
      const channel = new RTCResourceChannel(peer, 'ola');
      channel.listen(navigator.serviceWorker);
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};
