import fetchRTC from './fetch-rtc';

export const register = () => {
  if ('serviceWorker' in navigator) {
    // serviceWorker 注册
    window.addEventListener('load', () => {
      navigator.serviceWorker.addEventListener('message', ({ data }) => {
        console.log('【fetchRTC】发起', data);
        const { url, id } = data;

        console.log('id', id);

        fetchRTC(url, id).then(({ headers, response }) => {
          console.log('【fetchRTC】响应', headers, response);
          navigator.serviceWorker.controller.postMessage({
            id,
            headers,
            response,
          });
        });
      });
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
